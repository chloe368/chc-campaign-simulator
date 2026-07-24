import type { OutcomeType } from "./types";

export const OUTCOME_LABEL: Record<OutcomeType, string> = {
  "meeting-booked": "Meeting booked",
  "active-conversation": "Active conversation",
  "information-follow-up": "Information follow-up",
  "timed-nurture": "Timed nurture",
  "new-persona-route": "New-persona route",
  "long-term-awareness": "Long-term awareness",
  "clean-close": "Clean close",
  "opt-out": "Opt-out",
  "invalid-contact": "Invalid contact",
};

// Outcomes that count toward the "meaningful engagement or positive reply" goal.
export const MEANINGFUL_OUTCOMES: OutcomeType[] = [
  "meeting-booked",
  "active-conversation",
  "information-follow-up",
  "new-persona-route",
];

export function isMeaningfulOutcome(id: OutcomeType): boolean {
  return MEANINGFUL_OUTCOMES.includes(id);
}

// Categorise for the summary tone.
export function outcomeTone(id: OutcomeType): "positive" | "neutral" | "closed" {
  if (isMeaningfulOutcome(id)) return "positive";
  if (id === "opt-out" || id === "clean-close" || id === "invalid-contact") return "closed";
  return "neutral";
}
