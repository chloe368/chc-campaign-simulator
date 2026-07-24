import type { AccountProfile, Channel, SimulationSession } from "./types";

// Direct-touch channels each add one contact-pressure point.
// Passive ads / organic content exposure do not.
export const DIRECT_CHANNELS: Channel[] = [
  "email",
  "linkedin",
  "facebook",
  "instagram",
  "phone",
  "physical",
];

export function isDirectTouch(channel: Channel): boolean {
  return DIRECT_CHANNELS.includes(channel);
}

export function currentPressureLimit(session: SimulationSession, account: AccountProfile): number {
  const persona = account.personas.find((p) => p.id === session.currentPersonaId);
  return persona?.contactPressureLimit ?? 5;
}

// A warning is raised when the count has reached or passed the persona limit.
export function evaluatePressure(
  session: SimulationSession,
  account: AccountProfile,
): { warning: boolean; limit: number } {
  const limit = currentPressureLimit(session, account);
  return { warning: session.contactPressure >= limit, limit };
}
