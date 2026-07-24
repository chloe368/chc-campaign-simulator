import { describe, it, expect } from "vitest";
import { buildSession } from "../domain/simulation-reducer";
import { SAMPLE_ACCOUNT } from "../data/sample-account";
import { SAMPLE_SCENARIOS } from "../data/sample-scenarios";
import { DEFAULT_DEMO_WEIGHTS, makeRng, pickDemoResponse } from "../domain/demo-mode";
import { getCampaign } from "../data/campaigns";
import type { SimulationStep } from "../domain/types";

const CREATED = "2026-01-01T00:00:00.000Z";

describe("example account scenarios reach a defined end state", () => {
  for (const scenario of SAMPLE_SCENARIOS) {
    it(`"${scenario.title}" runs to an end state`, () => {
      const s = buildSession(scenario.campaignId, SAMPLE_ACCOUNT, scenario.steps, CREATED, scenario.id);
      expect(s.status, `${scenario.title} did not complete`).toBe("completed");
      expect(s.selectedOutcomeId).toBeDefined();
      // Every step must have been consumed (no invalid response ids).
      expect(s.steps).toEqual(scenario.steps);
    });
  }
});

describe("named end-to-end paths", () => {
  const cases: { name: string; campaign: Parameters<typeof getCampaign>[0]; steps: SimulationStep[]; outcome: string }[] = [
    {
      name: "Email-led meeting path",
      campaign: "email-led",
      steps: [
        { stageId: "prep", responseId: "ready" },
        { stageId: "email", responseId: "positive-meeting" },
        { stageId: "email-meeting-confirm", responseId: "confirmed" },
      ],
      outcome: "meeting-booked",
    },
    {
      name: "Email-led referral recovery path",
      campaign: "email-led",
      steps: [
        { stageId: "prep", responseId: "ready" },
        { stageId: "email", responseId: "referral" },
      ],
      outcome: "new-persona-route",
    },
    {
      name: "Social-awareness information path",
      campaign: "social-awareness",
      steps: [
        { stageId: "social", responseId: "ad-opened" },
        { stageId: "email", responseId: "question" },
      ],
      outcome: "information-follow-up",
    },
    {
      name: "Social-awareness silence path",
      campaign: "social-awareness",
      steps: [
        { stageId: "social", responseId: "no-signal" },
        { stageId: "email", responseId: "not-opened" },
        { stageId: "active-social", responseId: "not-seen" },
        { stageId: "route-change", responseId: "no-reply" },
        { stageId: "phone", responseId: "no-answer" },
      ],
      outcome: "timed-nurture",
    },
    {
      name: "Physical-mail routing path",
      campaign: "physical-mail-led",
      steps: [
        { stageId: "familiarity", responseId: "social-engagement" },
        { stageId: "physical", responseId: "accepted-assistant" },
        { stageId: "context-email", responseId: "opened-no-reply" },
        { stageId: "linkedin", responseId: "referral" },
      ],
      outcome: "new-persona-route",
    },
    {
      name: "Physical-mail rejection path",
      campaign: "physical-mail-led",
      steps: [
        { stageId: "familiarity", responseId: "no-engagement" },
        { stageId: "physical", responseId: "rejected" },
        { stageId: "context-email", responseId: "negative" },
      ],
      outcome: "clean-close",
    },
    {
      name: "Timed nurture path",
      campaign: "email-led",
      steps: [
        { stageId: "prep", responseId: "ready" },
        { stageId: "email", responseId: "not-now" },
        { stageId: "email-notnow", responseId: "named-date" },
      ],
      outcome: "timed-nurture",
    },
    {
      name: "Opt-out path",
      campaign: "email-led",
      steps: [
        { stageId: "prep", responseId: "ready" },
        { stageId: "email", responseId: "opt-out" },
      ],
      outcome: "opt-out",
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const s = buildSession(c.campaign, SAMPLE_ACCOUNT, c.steps, CREATED, "e2e");
      expect(s.status).toBe("completed");
      expect(s.selectedOutcomeId).toBe(c.outcome);
    });
  }
});

describe("auto-demo mode is reproducible and always terminates", () => {
  it("the same seed produces the same run and reaches an end state", () => {
    function runDemo(seed: number) {
      const campaign = getCampaign("email-led");
      let session = buildSession("email-led", SAMPLE_ACCOUNT, [], CREATED, "demo");
      let guard = 0;
      while (session.status !== "completed" && guard < 100) {
        const rng = makeRng(seed + session.steps.length * 7919);
        const id = pickDemoResponse(campaign, session, DEFAULT_DEMO_WEIGHTS, rng);
        if (!id) break;
        session = buildSession("email-led", SAMPLE_ACCOUNT, [...session.steps, { stageId: session.pendingStageId!, responseId: id }], CREATED, "demo");
        guard++;
      }
      return session;
    }
    const a = runDemo(42);
    const b = runDemo(42);
    expect(a.status).toBe("completed");
    expect(a.steps).toEqual(b.steps);
    expect(a.selectedOutcomeId).toBe(b.selectedOutcomeId);
  });
});
