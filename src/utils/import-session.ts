import type { CampaignId, SimulationSession } from "../domain/types";
import { CAMPAIGNS } from "../data/campaigns";
import type { ExportEnvelope } from "./export-session";

const VALID_IDS: CampaignId[] = CAMPAIGNS.map((c) => c.id);

// Parse and lightly validate an exported session. The reducer rebuilds full
// state from `steps`, so we only need the identifying fields to be sound.
export function importSession(json: string): SimulationSession {
  const parsed = JSON.parse(json) as ExportEnvelope | SimulationSession;
  const session = (parsed as ExportEnvelope).session ?? (parsed as SimulationSession);
  if (!session || typeof session !== "object") throw new Error("Not a valid session file.");
  if (!VALID_IDS.includes(session.campaignId)) {
    throw new Error(`Unknown campaign "${String(session.campaignId)}".`);
  }
  if (!Array.isArray(session.steps)) {
    throw new Error("Session is missing its step history.");
  }
  if (!session.account || !Array.isArray(session.account.personas)) {
    throw new Error("Session is missing its account profile.");
  }
  return session;
}
