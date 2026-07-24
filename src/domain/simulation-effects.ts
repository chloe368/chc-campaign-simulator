import type {
  AccountProfile,
  Persona,
  SimulationEffect,
  SimulationEvent,
  SimulationSession,
} from "./types";

// A small event factory keeps ids deterministic across replays.
export function makeEvent(
  seq: number,
  session: SimulationSession,
  partial: Omit<SimulationEvent, "id" | "timestamp" | "virtualDay">,
): SimulationEvent {
  return {
    id: `evt-${seq}`,
    timestamp: `${session.createdAt}#${seq}`,
    virtualDay: session.currentDay,
    ...partial,
  };
}

function personaByRole(account: AccountProfile, role: Persona["role"]): Persona | undefined {
  return account.personas.find((p) => p.role === role);
}

// Apply a single effect. Returns the next session and any events it generated.
export function applyEffect(
  session: SimulationSession,
  effect: SimulationEffect,
  account: AccountProfile,
  seq: number,
): { session: SimulationSession; events: SimulationEvent[] } {
  const events: SimulationEvent[] = [];
  let next: SimulationSession = { ...session };

  switch (effect.type) {
    case "pause-scheduled-outreach":
      next.scheduledOutreachActive = false;
      next.scheduledActions = next.scheduledActions.map((a) => ({ ...a, active: false }));
      break;
    case "resume-scheduled-outreach":
      next.scheduledOutreachActive = true;
      break;
    case "change-channel":
      if (next.currentChannel !== effect.channel) {
        events.push(
          makeEvent(seq, next, {
            eventType: "channel-change",
            stageId: next.currentStageId,
            label: `Channel change → ${effect.channel}`,
            details: `Route moved to ${effect.channel}.`,
          }),
        );
      }
      next.currentChannel = effect.channel;
      break;
    case "change-persona": {
      const persona = personaByRole(account, effect.personaRole);
      if (persona && persona.id !== next.currentPersonaId) {
        next.currentPersonaId = persona.id;
        events.push(
          makeEvent(seq, next, {
            eventType: "persona-change",
            stageId: next.currentStageId,
            label: `Persona handoff → ${persona.name}`,
            details: `Owner changed to ${persona.name} (${persona.title}). Same account story, new role angle.`,
          }),
        );
      }
      break;
    }
    case "set-awareness":
      next.awarenessState = effect.value;
      break;
    case "set-engagement":
      next.engagementState = effect.value;
      break;
    case "schedule-follow-up":
      next.scheduledActions = [
        ...next.scheduledActions,
        {
          id: `sched-${next.scheduledActions.length + 1}`,
          label: "Timed follow-up",
          dueDay: next.currentDay + effect.days,
          channel: "nurture",
          active: true,
        },
      ];
      break;
    case "record-timing-reason":
      next.timingReason = effect.reason ?? next.timingReason ?? "Timing deferred";
      break;
    case "correct-contact":
      next.contactCorrected = true;
      next.notes = [...next.notes, "Contact data corrected and verified."];
      break;
    case "suppress-contact":
      next.scheduledOutreachActive = false;
      next.notes = [...next.notes, "Contact suppressed from direct outreach."];
      break;
    case "reduce-frequency":
      next.notes = [...next.notes, "Reduced outreach frequency."];
      break;
    case "lock-physical":
      next.physicalLocked = true;
      break;
    case "add-account-note":
      next.notes = [...next.notes, effect.text];
      break;
    default: {
      // Exhaustiveness guard.
      const _never: never = effect;
      return _never;
    }
  }

  return { session: next, events };
}

export function applyEffects(
  session: SimulationSession,
  effects: SimulationEffect[],
  account: AccountProfile,
  startSeq: number,
): { session: SimulationSession; events: SimulationEvent[] } {
  let current = session;
  const allEvents: SimulationEvent[] = [];
  let seq = startSeq;
  for (const effect of effects) {
    const { session: nextSession, events } = applyEffect(current, effect, account, seq);
    current = nextSession;
    allEvents.push(...events);
    seq += 1 + events.length;
  }
  return { session: current, events: allEvents };
}
