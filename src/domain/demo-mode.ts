import type { CampaignDefinition, ResponseStrength, SimulationSession } from "./types";
import { getStage } from "../data/campaigns";

// Deterministic PRNG (mulberry32) so a seed reproduces the same demo run.
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Demonstration assumptions — NOT expected real-world conversion rates.
// The user can edit these in the UI.
export type DemoWeights = Record<ResponseStrength, number>;

export const DEFAULT_DEMO_WEIGHTS: DemoWeights = {
  positive: 2,
  "meaningful-engagement": 3,
  "passive-awareness": 5,
  timing: 2,
  routing: 2,
  negative: 1,
  stop: 1,
};

// Pick the next response id for the pending stage, weighted by strength.
export function pickDemoResponse(
  campaign: CampaignDefinition,
  session: SimulationSession,
  weights: DemoWeights,
  rng: () => number,
): string | null {
  if (!session.pendingStageId || session.status === "completed") return null;
  const stage = getStage(campaign, session.pendingStageId);
  const options = stage.availableResponses;
  if (options.length === 0) return null;

  const weighted = options.map((r) => ({ id: r.id, w: Math.max(0, weights[r.strength] ?? 1) }));
  const total = weighted.reduce((sum, x) => sum + x.w, 0);
  if (total <= 0) return options[Math.floor(rng() * options.length)].id;

  let roll = rng() * total;
  for (const x of weighted) {
    roll -= x.w;
    if (roll <= 0) return x.id;
  }
  return weighted[weighted.length - 1].id;
}
