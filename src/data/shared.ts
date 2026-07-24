import type { CampaignOutcome, OutcomeType, ResponseOption } from "../domain/types";

// Standard end states, shared across all three campaigns.
export const STANDARD_OUTCOMES: CampaignOutcome[] = [
  {
    id: "meeting-booked",
    label: "Meeting booked",
    type: "meeting-booked",
    description: "A meeting is confirmed with an owner who can act.",
    lesson: "A strong, relevant first touch and a prompt human reply closed the loop.",
  },
  {
    id: "active-conversation",
    label: "Active conversation",
    type: "active-conversation",
    description: "A real two-way exchange is underway with the right person.",
    lesson: "Momentum came from answering the actual question, not pushing the sequence.",
  },
  {
    id: "information-follow-up",
    label: "Information follow-up",
    type: "information-follow-up",
    description: "One requested item was sent and a follow-up date agreed.",
    lesson: "Sending only what was asked kept trust intact and left a clear next step.",
  },
  {
    id: "timed-nurture",
    label: "Timed nurture",
    type: "timed-nurture",
    description: "Outreach is paused with a recorded reason and a return date.",
    lesson: "Respecting timing preserves the relationship for a relevant re-entry.",
  },
  {
    id: "new-persona-route",
    label: "New-persona route",
    type: "new-persona-route",
    description: "The account story continues with a newly identified owner.",
    lesson: "A referral was treated as a handoff, not a resend of the old message.",
  },
  {
    id: "long-term-awareness",
    label: "Long-term awareness",
    type: "long-term-awareness",
    description: "Direct outreach ends; the account stays lightly aware via nurture.",
    lesson: "Silence was capped — no endless follow-ups — and left a clean footprint.",
  },
  {
    id: "clean-close",
    label: "Clean close",
    type: "clean-close",
    description: "The route ends respectfully with no open pressure.",
    lesson: "Acknowledging a clear 'no priority' avoided arguing and kept goodwill.",
  },
  {
    id: "opt-out",
    label: "Opt-out",
    type: "opt-out",
    description: "The contact opted out; direct outreach stopped and was suppressed.",
    lesson: "Opt-out is honored immediately and cancels scheduled direct actions.",
  },
  {
    id: "invalid-contact",
    label: "Invalid contact",
    type: "invalid-contact",
    description: "The contact was wrong or departed; data was corrected before continuing.",
    lesson: "Verify the owner before spending more effort on the wrong route.",
  },
];

export function outcome(id: OutcomeType): CampaignOutcome {
  const found = STANDARD_OUTCOMES.find((o) => o.id === id);
  if (!found) throw new Error(`Unknown outcome ${id}`);
  return found;
}

// ---- Reusable response fragments -----------------------------------------
// These are common leaf branches many stages reuse (opt-out, referral entry,
// not-now). Each still resolves to a concrete next stage or outcome.

export function optOutResponse(): ResponseOption {
  return {
    id: "opt-out",
    label: "Opt-out",
    description: "The person asks not to be contacted again.",
    strength: "stop",
    condition: "Any explicit request to stop.",
    pausesCampaign: true,
    nextAction: {
      label: "Stop and suppress",
      explanation:
        "Stop direct outreach immediately, suppress the contact, cancel scheduled direct actions, and review whether account-level outreach should also stop.",
      outcomeId: "opt-out",
    },
    effects: [
      { type: "pause-scheduled-outreach" },
      { type: "suppress-contact" },
      { type: "add-account-note", text: "Opt-out received — contact suppressed." },
    ],
  };
}
