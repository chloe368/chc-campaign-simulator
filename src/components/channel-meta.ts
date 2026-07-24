import type { Channel, ResponseStrength, OutcomeType } from "../domain/types";

export interface ChannelMeta {
  label: string;
  color: string; // hex used for canvas + badges
  icon: string; // short text glyph (has text alt via label)
}

export const CHANNEL_META: Record<Channel, ChannelMeta> = {
  preparation: { label: "Preparation", color: "#8a8a82", icon: "PR" },
  email: { label: "Email", color: "#2563eb", icon: "EM" },
  linkedin: { label: "LinkedIn", color: "#4f46e5", icon: "IN" },
  facebook: { label: "Facebook", color: "#f26d5b", icon: "FB" },
  instagram: { label: "Instagram", color: "#f26d5b", icon: "IG" },
  "paid-social": { label: "Paid social", color: "#f97316", icon: "AD" },
  website: { label: "Website", color: "#0d9488", icon: "WB" },
  content: { label: "Content", color: "#0d9488", icon: "CO" },
  phone: { label: "Phone", color: "#16a34a", icon: "PH" },
  physical: { label: "Physical", color: "#c79a3a", icon: "PM" },
  "persona-handoff": { label: "Persona handoff", color: "#8b5cf6", icon: "PN" },
  nurture: { label: "Nurture", color: "#8a8a82", icon: "NU" },
};

export interface StrengthMeta {
  label: string;
  color: string;
  note: string;
}

export const STRENGTH_META: Record<ResponseStrength, StrengthMeta> = {
  positive: { label: "Positive", color: "#16a34a", note: "Genuine positive reply — pauses the sequence." },
  "meaningful-engagement": { label: "Meaningful engagement", color: "#0d9488", note: "A real two-way signal." },
  "passive-awareness": { label: "Passive awareness", color: "#64748b", note: "Awareness only — not intent." },
  timing: { label: "Timing", color: "#d97706", note: "Right topic, wrong time." },
  routing: { label: "Routing", color: "#8b5cf6", note: "Points to the correct owner or fixes data." },
  negative: { label: "Negative", color: "#ef6b6b", note: "A clear no." },
  stop: { label: "Stop", color: "#991b1b", note: "Opt-out — stop and suppress." },
};

export const OUTCOME_COLOR: Record<OutcomeType, string> = {
  "meeting-booked": "#16a34a",
  "active-conversation": "#0d9488",
  "information-follow-up": "#0d9488",
  "timed-nurture": "#d97706",
  "new-persona-route": "#8b5cf6",
  "long-term-awareness": "#64748b",
  "clean-close": "#8a8a82",
  "opt-out": "#991b1b",
  "invalid-contact": "#ef6b6b",
};

export function channelBadge(channel: Channel) {
  return CHANNEL_META[channel] ?? { label: channel, color: "#8a8a82", icon: "?" };
}
