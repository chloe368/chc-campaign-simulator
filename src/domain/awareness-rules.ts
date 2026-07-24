import type { AwarenessState, EngagementState, ResponseStrength } from "./types";

// Ordered awareness ladder (Rule: passive signals are awareness only).
export const AWARENESS_LADDER: AwarenessState[] = [
  "unaware",
  "exposed",
  "recognizes",
  "interested",
  "engaged",
  "active-conversation",
  "qualified-next-step",
];

export const AWARENESS_LABEL: Record<AwarenessState, string> = {
  unaware: "Unaware",
  exposed: "Exposed",
  recognizes: "Recognizes topic or sender",
  interested: "Interested",
  engaged: "Engaged",
  "active-conversation": "Active conversation",
  "qualified-next-step": "Qualified next step",
};

export const ENGAGEMENT_LABEL: Record<EngagementState, string> = {
  none: "None",
  "passive-awareness": "Passive awareness",
  "meaningful-engagement": "Meaningful engagement",
  conversation: "Active conversation",
};

export function awarenessIndex(state: AwarenessState): number {
  return AWARENESS_LADDER.indexOf(state);
}

// These strengths count only as awareness, never as intent.
const PASSIVE_STRENGTHS: ResponseStrength[] = ["passive-awareness"];

export function isPassiveOnly(strength: ResponseStrength): boolean {
  return PASSIVE_STRENGTHS.includes(strength);
}

// Meaningful engagement per the playbook.
const MEANINGFUL_STRENGTHS: ResponseStrength[] = [
  "meaningful-engagement",
  "positive",
  "timing",
  "routing",
];

export function isMeaningful(strength: ResponseStrength): boolean {
  return MEANINGFUL_STRENGTHS.includes(strength);
}
