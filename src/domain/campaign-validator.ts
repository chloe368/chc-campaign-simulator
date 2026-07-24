import type { CampaignDefinition, CampaignStage, ResponseOption } from "./types";

export interface ValidationIssue {
  level: "error" | "warning";
  code: string;
  message: string;
  campaignId: string;
  stageId?: string;
  responseId?: string;
}

function nextTargets(r: ResponseOption): { stage?: string; outcome?: string } {
  return { stage: r.nextAction.nextStageId, outcome: r.nextAction.outcomeId };
}

// Validate a single campaign definition against the playbook's structural and
// rule-level invariants. Returns every issue found.
export function validateCampaign(campaign: CampaignDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const stageIds = new Set(campaign.stages.map((s) => s.id));
  const outcomeIds = new Set<string>(campaign.outcomes.map((o) => o.id));
  const err = (code: string, message: string, stageId?: string, responseId?: string) =>
    issues.push({ level: "error", code, message, campaignId: campaign.id, stageId, responseId });
  const warn = (code: string, message: string, stageId?: string, responseId?: string) =>
    issues.push({ level: "warning", code, message, campaignId: campaign.id, stageId, responseId });

  const entry = campaign.stages.find((s) => s.isEntry);
  if (!entry) err("no-entry", "Campaign has no entry stage (isEntry: true).");

  // Per-stage / per-response structural checks.
  for (const stage of campaign.stages) {
    if (stage.availableResponses.length === 0) {
      err("action-without-response", `Stage "${stage.id}" has no response options.`, stage.id);
    }
    for (const r of stage.availableResponses) {
      if (!r.nextAction) {
        err("response-without-next", `Response "${r.id}" has no next action.`, stage.id, r.id);
        continue;
      }
      const { stage: nextStage, outcome } = nextTargets(r);
      if (!nextStage && !outcome && !r.nextAction.nextResponseSetId) {
        err(
          "next-without-target",
          `Response "${r.id}" resolves to no next stage, response set or outcome.`,
          stage.id,
          r.id,
        );
      }
      if (nextStage && !stageIds.has(nextStage)) {
        err("invalid-next-stage", `Response "${r.id}" points to unknown stage "${nextStage}".`, stage.id, r.id);
      }
      if (outcome && !outcomeIds.has(outcome)) {
        err("missing-outcome", `Response "${r.id}" points to unknown outcome "${outcome}".`, stage.id, r.id);
      }

      // Rule: opt-out must stop outreach.
      if (outcome === "opt-out") {
        const stops = r.effects.some(
          (e) => e.type === "suppress-contact" || e.type === "pause-scheduled-outreach",
        );
        if (!stops) err("optout-no-stop", `Opt-out response "${r.id}" does not stop/suppress outreach.`, stage.id, r.id);
      }

      // Rule: positive reply pauses the campaign.
      if (r.strength === "positive") {
        const pauses = r.pausesCampaign || r.effects.some((e) => e.type === "pause-scheduled-outreach");
        if (!pauses)
          err("positive-no-pause", `Positive response "${r.id}" does not pause the campaign.`, stage.id, r.id);
      }

      // Rule: "not now" / timing must handle timing.
      if (r.strength === "timing") {
        const handlesTiming =
          outcome === "timed-nurture" ||
          r.effects.some((e) => e.type === "record-timing-reason" || e.type === "schedule-follow-up");
        if (!handlesTiming)
          warn("timing-unhandled", `Timing response "${r.id}" has no timing handling.`, stage.id, r.id);
      }

      // Rule: referral (→ new-persona) must hand off the persona.
      if (outcome === "new-persona-route") {
        const handsOff = r.changesPersona || r.effects.some((e) => e.type === "change-persona");
        if (!handsOff)
          warn("referral-no-handoff", `New-persona response "${r.id}" has no persona handoff.`, stage.id, r.id);
      }

      // Rule: a physical-rejection branch must not step into another physical delivery.
      const locksPhysical = r.effects.some((e) => e.type === "lock-physical");
      if (locksPhysical && nextStage) {
        const target = campaign.stages.find((s) => s.id === nextStage);
        if (target && target.channel === "physical") {
          err(
            "physical-after-rejection",
            `Response "${r.id}" locks physical yet routes to a physical stage.`,
            stage.id,
            r.id,
          );
        }
      }
    }
  }

  // Reachability from the entry stage (following nextStageId edges).
  const reachable = new Set<string>();
  const reachedOutcomes = new Set<string>();
  if (entry) {
    const queue: string[] = [entry.id];
    reachable.add(entry.id);
    while (queue.length) {
      const id = queue.shift()!;
      const stage = campaign.stages.find((s) => s.id === id);
      if (!stage) continue;
      for (const r of stage.availableResponses) {
        if (r.nextAction.outcomeId) reachedOutcomes.add(r.nextAction.outcomeId);
        const ns = r.nextAction.nextStageId;
        if (ns && !reachable.has(ns)) {
          reachable.add(ns);
          queue.push(ns);
        }
      }
    }
  }
  for (const stage of campaign.stages) {
    if (!reachable.has(stage.id)) {
      warn("unreachable-stage", `Stage "${stage.id}" is unreachable from the entry stage.`, stage.id);
    }
  }
  for (const outcome of campaign.outcomes) {
    if (!reachedOutcomes.has(outcome.id)) {
      warn("unreachable-outcome", `Outcome "${outcome.id}" is never reached.`);
    }
  }

  // Every stage must be able to reach some outcome (no dead ends, no unbounded
  // cycles). Detects "silence with unlimited follow-up potential".
  const canReach = new Map<string, boolean>();
  const visiting = new Set<string>();
  const dfs = (id: string): boolean => {
    if (canReach.has(id)) return canReach.get(id)!;
    if (visiting.has(id)) return false; // in a cycle for now; other branches may still exit
    visiting.add(id);
    const stage = campaign.stages.find((s) => s.id === id);
    let ok = false;
    if (stage) {
      for (const r of stage.availableResponses) {
        if (r.nextAction.outcomeId) {
          ok = true;
          break;
        }
        const ns = r.nextAction.nextStageId;
        if (ns && dfs(ns)) {
          ok = true;
          break;
        }
      }
    }
    visiting.delete(id);
    canReach.set(id, ok);
    return ok;
  };
  for (const stage of campaign.stages) {
    if (!dfs(stage.id)) {
      err("no-exit", `Stage "${stage.id}" cannot reach any end state (dead end or unbounded cycle).`, stage.id);
    }
  }

  return issues;
}

export function validateAllCampaigns(campaigns: CampaignDefinition[]): ValidationIssue[] {
  return campaigns.flatMap(validateCampaign);
}
