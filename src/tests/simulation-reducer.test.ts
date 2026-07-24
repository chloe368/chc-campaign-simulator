import { describe, it, expect } from "vitest";
import { buildSession, simReducer, type SimState } from "../domain/simulation-reducer";
import { SAMPLE_ACCOUNT } from "../data/sample-account";
import type { CampaignId, SimulationStep } from "../domain/types";
import { CAMPAIGNS } from "../data/campaigns";
import { exportSession } from "../utils/export-session";
import { importSession } from "../utils/import-session";

const CREATED = "2026-01-01T00:00:00.000Z";

function run(campaignId: CampaignId, steps: SimulationStep[]) {
  return buildSession(campaignId, SAMPLE_ACCOUNT, steps, CREATED, "test-session");
}

describe("starting each campaign", () => {
  it("starts at the entry stage with clean state", () => {
    for (const c of CAMPAIGNS) {
      const s = run(c.id, []);
      const entry = c.stages.find((x) => x.isEntry)!;
      expect(s.currentStageId).toBe(entry.id);
      expect(s.pendingStageId).toBe(entry.id);
      expect(s.status).toBe("active");
      expect(s.awarenessState).toBe("unaware");
      expect(s.contactPressure).toBe(0);
      expect(s.scheduledOutreachActive).toBe(true);
    }
  });
});

describe("rule: positive reply pauses the sequence", () => {
  it("pauses scheduled outreach on a positive reply", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "positive-meeting" },
    ]);
    expect(s.scheduledOutreachActive).toBe(false);
    expect(s.engagementState).toBe("conversation");
    expect(s.pendingStageId).toBe("email-meeting-confirm");
  });
});

describe("rule: passive awareness stays awareness only", () => {
  it("opened-no-reply sets awareness but not engagement, and continues", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "opened-no-reply" },
    ]);
    expect(s.awarenessState).toBe("exposed");
    expect(s.engagementState).toBe("passive-awareness");
    expect(s.scheduledOutreachActive).toBe(true);
    expect(s.pendingStageId).toBe("email-open-followup");
    expect(s.currentDay).toBe(3); // day 1 (prep→email) + 2-day follow-up wait
  });
});

describe("rule: not-opened changes channel", () => {
  it("moves from email to linkedin", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "not-opened" },
    ]);
    expect(s.currentChannel).toBe("linkedin");
    expect(s.pendingStageId).toBe("linkedin");
    expect(s.history.some((e) => e.eventType === "channel-change")).toBe(true);
  });
});

describe("rule: referral opens a new-persona route", () => {
  it("changes persona and completes on new-persona-route", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "referral" },
    ]);
    expect(s.status).toBe("completed");
    expect(s.selectedOutcomeId).toBe("new-persona-route");
    expect(s.currentPersonaId).not.toBe(SAMPLE_ACCOUNT.primaryPersonaId);
    expect(s.history.some((e) => e.eventType === "persona-change")).toBe(true);
  });
});

describe("rule: not-now opens a timed nurture", () => {
  it("records a timing reason and schedules a follow-up", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "not-now" },
      { stageId: "email-notnow", responseId: "competing" },
    ]);
    expect(s.status).toBe("completed");
    expect(s.selectedOutcomeId).toBe("timed-nurture");
    expect(s.timingReason).toBeTruthy();
    expect(s.scheduledActions.length).toBeGreaterThan(0);
  });
});

describe("rule: opt-out suppresses the contact", () => {
  it("stops outreach and completes on opt-out", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "opt-out" },
    ]);
    expect(s.status).toBe("completed");
    expect(s.selectedOutcomeId).toBe("opt-out");
    expect(s.scheduledOutreachActive).toBe(false);
    expect(s.notes.join(" ")).toMatch(/suppress/i);
  });
});

describe("rule: wrong contact is corrected", () => {
  it("marks the contact corrected on a hard bounce", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "hard-bounce" },
    ]);
    expect(s.status).toBe("completed");
    expect(s.selectedOutcomeId).toBe("invalid-contact");
    expect(s.contactCorrected).toBe(true);
  });
});

describe("rule: physical rejection locks physical and never retries", () => {
  it("locks physical and does not route to a physical stage", () => {
    const s = run("physical-mail-led", [
      { stageId: "familiarity", responseId: "no-engagement" },
      { stageId: "physical", responseId: "rejected" },
    ]);
    expect(s.physicalLocked).toBe(true);
    expect(s.pendingStageId).toBe("context-email"); // digital, not physical
  });
});

describe("rule: silence cannot create endless follow-ups", () => {
  it("a silent route through email-led still terminates at an end state", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "not-opened" },
      { stageId: "linkedin", responseId: "dm-not-seen" },
      { stageId: "final-digital", responseId: "no-reply" },
      { stageId: "phone", responseId: "no-answer" },
    ]);
    expect(s.status).toBe("completed");
    expect(["timed-nurture", "long-term-awareness", "clean-close"]).toContain(s.selectedOutcomeId);
  });
});

describe("rule: contact pressure counts direct touches only", () => {
  it("increments on email/phone but not preparation", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" }, // preparation → no point
      { stageId: "email", responseId: "not-opened" }, // email → +1
      { stageId: "linkedin", responseId: "dm-no-reply" }, // linkedin → +1
    ]);
    expect(s.contactPressure).toBe(2);
  });

  it("raises a warning once the persona limit is reached", () => {
    // Executive limit is 3. Drive several direct touches by walking the phone path.
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "opened-no-reply" }, // +1 email
      { stageId: "email-open-followup", responseId: "no-response" }, // email stage +1
      { stageId: "linkedin", responseId: "dm-no-reply" }, // +1 linkedin
      { stageId: "final-digital", responseId: "no-reply" }, // email +1
      { stageId: "phone", responseId: "no-answer" }, // phone +1
    ]);
    expect(s.contactPressure).toBeGreaterThanOrEqual(5);
    expect(s.pressureWarning).toBe(true);
  });
});

describe("end-state completion", () => {
  it("meeting path completes on meeting-booked", () => {
    const s = run("email-led", [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "positive-meeting" },
      { stageId: "email-meeting-confirm", responseId: "confirmed" },
    ]);
    expect(s.status).toBe("completed");
    expect(s.selectedOutcomeId).toBe("meeting-booked");
    expect(s.pendingStageId).toBeUndefined();
  });
});

describe("reducer: rewind and reset", () => {
  it("rewinds to a prior step so a different branch can be chosen", () => {
    let state: SimState = { session: run("email-led", []) };
    state = simReducer(state, { type: "SELECT_RESPONSE", stageId: "prep", responseId: "ready" });
    state = simReducer(state, { type: "SELECT_RESPONSE", stageId: "email", responseId: "positive-meeting" });
    expect(state.session!.pendingStageId).toBe("email-meeting-confirm");
    state = simReducer(state, { type: "REWIND_TO_STEP", stepIndex: 1 });
    expect(state.session!.pendingStageId).toBe("email"); // back to the email decision
    expect(state.session!.steps).toHaveLength(1);
    // choose a different branch
    state = simReducer(state, { type: "SELECT_RESPONSE", stageId: "email", responseId: "opt-out" });
    expect(state.session!.selectedOutcomeId).toBe("opt-out");
  });

  it("reset clears steps back to the entry stage", () => {
    let state: SimState = { session: run("email-led", [{ stageId: "prep", responseId: "ready" }]) };
    state = simReducer(state, { type: "RESET" });
    expect(state.session!.steps).toHaveLength(0);
    expect(state.session!.pendingStageId).toBe("prep");
  });
});

describe("export and import round-trips", () => {
  it("re-imports to an equivalent session", () => {
    const original = run("social-awareness", [
      { stageId: "social", responseId: "ad-opened" },
      { stageId: "email", responseId: "question" },
    ]);
    const json = exportSession(original);
    const imported = importSession(json);
    const rebuilt = buildSession(imported.campaignId, imported.account, imported.steps, imported.createdAt, imported.id);
    expect(rebuilt.selectedOutcomeId).toBe(original.selectedOutcomeId);
    expect(rebuilt.steps).toEqual(original.steps);
    expect(rebuilt.status).toBe("completed");
  });

  it("rejects an unknown campaign id", () => {
    expect(() => importSession(JSON.stringify({ session: { campaignId: "nope", steps: [], account: SAMPLE_ACCOUNT } }))).toThrow();
  });
});
