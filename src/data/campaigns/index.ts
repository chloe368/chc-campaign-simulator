import type { CampaignDefinition, CampaignId } from "../../domain/types";
import { emailLedCampaign } from "./email-led";
import { socialAwarenessCampaign } from "./social-awareness";
import { physicalMailLedCampaign } from "./physical-mail-led";

export const CAMPAIGNS: CampaignDefinition[] = [
  emailLedCampaign,
  socialAwarenessCampaign,
  physicalMailLedCampaign,
];

export function getCampaign(id: CampaignId): CampaignDefinition {
  const c = CAMPAIGNS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown campaign ${id}`);
  return c;
}

export function getStage(campaign: CampaignDefinition, stageId: string) {
  const s = campaign.stages.find((x) => x.id === stageId);
  if (!s) throw new Error(`Unknown stage ${stageId} in ${campaign.id}`);
  return s;
}

export { emailLedCampaign, socialAwarenessCampaign, physicalMailLedCampaign };
