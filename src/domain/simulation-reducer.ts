import type {
  AccountProfile,
  CampaignDefinition,
  CampaignId,
  SimulationEvent,
  SimulationSession,
  SimulationStep,
} from "./types";
import { getCampaign, getStage } from "../data/campaigns";
import { applyEffects, makeEvent } from "./simulation-effects";
import { evaluatePressure } from "./pressure-rules";
import { isDirectTouch } from "./pressure-rules";

function entryStage(campaign: CampaignDefinition) {
  const entry = campaign.stages.find((s) => s.isEntry) ?? campaign.stages[0];
  return entry;
}

function initSession(
  campaignId: CampaignId,
  account: AccountProfile,
  createdAt: string,
  id: string,
): SimulationSession {
  const campaign = getCampaign(campaignId);
  const entry = entryStage(campaign);
  return {
    id,
    campaignId,
    account,
    currentStageId: entry.id,
    currentPersonaId: account.primaryPersonaId,
    currentChannel: entry.channel,
    currentDay: 0,
    status: "active",
    awarenessState: "unaware",
    engagementState: "none",
    contactPressure: 0,
    scheduledOutreachActive: true,
    physicalLocked: false,
    contactCorrected: false,
    history: [],
    scheduledActions: [],
    notes: [],
    pendingStageId: entry.id,
    createdAt,
    steps: [],
    pressureWarning: false,
  };
}

// Deterministically rebuild the whole session by replaying an ordered list of
// choices. This is the single source of truth for state — advancing, rewinding
// and importing all funnel through here.
export function buildSession(
  campaignId: CampaignId,
  account: AccountProfile,
  steps: SimulationStep[],
  createdAt: string,
  id: string,
): SimulationSession {
  const campaign = getCampaign(campaignId);
  let session = initSession(campaignId, account, createdAt, id);
  let seq = 0;

  steps.forEach((step, stepIndex) => {
    if (session.status === "completed") return; // guard: no steps past an outcome
    const stage = getStage(campaign, step.stageId);

    // 1. Direct action performed at this stage.
    session = {
      ...session,
      currentStageId: stage.id,
      currentChannel: stage.channel,
      history: [
        ...session.history,
        makeEvent(seq++, session, {
          eventType: "action",
          stageId: stage.id,
          label: stage.label,
          details: stage.directAction,
          stepIndex,
        }),
      ],
    };

    // 2. Parallel actions running beside this action (awareness/engagement).
    for (const pa of stage.parallelActions) {
      session = {
        ...session,
        history: [
          ...session.history,
          makeEvent(seq++, session, {
            eventType: "parallel-action",
            stageId: stage.id,
            label: pa.label,
            details: `${pa.purpose} (${pa.signalType === "engagement" ? "can create a signal" : "awareness only"})`,
            stepIndex,
          }),
        ],
      };
    }

    // 3. Contact pressure: only direct-touch channels add a point.
    if (isDirectTouch(stage.channel)) {
      session = { ...session, contactPressure: session.contactPressure + 1 };
    }

    // 4. The chosen response.
    const response = stage.availableResponses.find((r) => r.id === step.responseId);
    if (!response) throw new Error(`Unknown response ${step.responseId} in stage ${stage.id}`);
    session = {
      ...session,
      history: [
        ...session.history,
        makeEvent(seq++, session, {
          eventType: "response",
          stageId: stage.id,
          label: response.label,
          details: response.description,
          stepIndex,
        }),
      ],
    };

    // 5. Apply the response's effects.
    const applied = applyEffects(session, response.effects, account, seq);
    session = applied.session;
    session = { ...session, history: [...session.history, ...applied.events] };
    seq += applied.events.length;

    // 6. Resolve the next action: wait, then outcome or next stage.
    const na = response.nextAction;
    if (na.waitDays && na.waitDays > 0) {
      session = {
        ...session,
        currentDay: session.currentDay + na.waitDays,
      };
      session = {
        ...session,
        history: [
          ...session.history,
          makeEvent(seq++, session, {
            eventType: "wait",
            stageId: stage.id,
            label: `Wait ${na.waitDays} day${na.waitDays === 1 ? "" : "s"}`,
            details: na.explanation,
            stepIndex,
          }),
        ],
      };
    }

    if (na.outcomeId) {
      const outcome = campaign.outcomes.find((o) => o.id === na.outcomeId);
      session = {
        ...session,
        status: "completed",
        selectedOutcomeId: na.outcomeId,
        pendingStageId: undefined,
        history: [
          ...session.history,
          makeEvent(seq++, session, {
            eventType: "outcome",
            stageId: stage.id,
            label: `End state: ${outcome?.label ?? na.outcomeId}`,
            details: na.explanation,
            stepIndex,
          }),
        ],
      };
    } else if (na.nextStageId) {
      const nextStage = getStage(campaign, na.nextStageId);
      const prevChannel = session.currentChannel;
      session = {
        ...session,
        currentStageId: nextStage.id,
        pendingStageId: nextStage.id,
        currentChannel: nextStage.channel,
      };
      if (prevChannel !== nextStage.channel) {
        session = {
          ...session,
          history: [
            ...session.history,
            makeEvent(seq++, session, {
              eventType: "channel-change",
              stageId: nextStage.id,
              label: `Next channel → ${nextStage.channel}`,
              details: `The next action uses ${nextStage.channel}.`,
              stepIndex,
            }),
          ],
        };
      }
    }
  });

  const pressure = evaluatePressure(session, account);
  // `steps` is the source of truth for replay/rewind/export — persist it.
  session = { ...session, steps, pressureWarning: pressure.warning };
  return session;
}

// ---------------------------------------------------------------------------
// Reducer surface — thin wrappers that recompute via buildSession.
// ---------------------------------------------------------------------------
export type SimAction =
  | { type: "START"; campaignId: CampaignId; account: AccountProfile; createdAt: string; id: string }
  | { type: "SELECT_RESPONSE"; stageId: string; responseId: string }
  | { type: "REWIND_TO_STEP"; stepIndex: number }
  | { type: "RESET" }
  | { type: "IMPORT"; session: SimulationSession }
  | { type: "REPLACE"; session: SimulationSession };

export interface SimState {
  session: SimulationSession | null;
}

export function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "START": {
      const session = buildSession(action.campaignId, action.account, [], action.createdAt, action.id);
      return { session };
    }
    case "SELECT_RESPONSE": {
      if (!state.session) return state;
      const s = state.session;
      const steps = [...s.steps, { stageId: action.stageId, responseId: action.responseId }];
      const session = buildSession(s.campaignId, s.account, steps, s.createdAt, s.id);
      return { session };
    }
    case "REWIND_TO_STEP": {
      if (!state.session) return state;
      const s = state.session;
      const steps = s.steps.slice(0, action.stepIndex);
      const session = buildSession(s.campaignId, s.account, steps, s.createdAt, s.id);
      return { session };
    }
    case "RESET": {
      if (!state.session) return state;
      const s = state.session;
      const session = buildSession(s.campaignId, s.account, [], s.createdAt, s.id);
      return { session };
    }
    case "IMPORT":
    case "REPLACE": {
      // Rebuild from the imported steps so state is always internally consistent.
      const imp = action.session;
      const session = buildSession(imp.campaignId, imp.account, imp.steps, imp.createdAt, imp.id);
      return { session };
    }
    default:
      return state;
  }
}
