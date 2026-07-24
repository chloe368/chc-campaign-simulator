import type { CampaignId, SimulationStep } from "../domain/types";

export interface SampleScenario {
  id: string;
  title: string;
  campaignId: CampaignId;
  summary: string;
  steps: SimulationStep[];
}

// "Example account scenarios" — deterministic, validated walks through the
// campaign trees. These are illustrations, not predictions.
export const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: "s1",
    title: "Positive reply after first email",
    campaignId: "email-led",
    summary: "A strong first email lands, the prospect replies ready to talk, and a meeting is confirmed.",
    steps: [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "positive-meeting" },
      { stageId: "email-meeting-confirm", responseId: "confirmed" },
    ],
  },
  {
    id: "s2",
    title: "Opened, no reply → LinkedIn → phone routing",
    campaignId: "email-led",
    summary: "Awareness without a reply moves to LinkedIn, then a call reveals a different owner.",
    steps: [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "opened-no-reply" },
      { stageId: "email-open-followup", responseId: "no-response" },
      { stageId: "linkedin", responseId: "dm-no-reply" },
      { stageId: "final-digital", responseId: "no-reply" },
      { stageId: "phone", responseId: "wrong-contact" },
    ],
  },
  {
    id: "s3",
    title: "Social awareness → email question → information",
    campaignId: "social-awareness",
    summary: "Ad and content engagement precede an email question that resolves into a requested asset.",
    steps: [
      { stageId: "social", responseId: "ad-opened" },
      { stageId: "email", responseId: "question" },
    ],
  },
  {
    id: "s4",
    title: "No signal → silence → phone referral",
    campaignId: "social-awareness",
    summary: "No social signal, an unopened email, a one-week pause, then a phone referral to a new owner.",
    steps: [
      { stageId: "social", responseId: "no-signal" },
      { stageId: "email", responseId: "not-opened" },
      { stageId: "active-social", responseId: "not-seen" },
      { stageId: "route-change", responseId: "no-reply" },
      { stageId: "phone", responseId: "referral" },
    ],
  },
  {
    id: "s5",
    title: "Package to assistant → email → referral",
    campaignId: "physical-mail-led",
    summary: "A physical note reaches an assistant; a context email goes unanswered; LinkedIn surfaces the true owner.",
    steps: [
      { stageId: "familiarity", responseId: "social-engagement" },
      { stageId: "physical", responseId: "accepted-assistant" },
      { stageId: "context-email", responseId: "opened-no-reply" },
      { stageId: "linkedin", responseId: "referral" },
    ],
  },
  {
    id: "s6",
    title: "Delivery rejected → digital → clean close",
    campaignId: "physical-mail-led",
    summary: "Office policy declines the gesture; the route respects it, moves digital, and closes cleanly.",
    steps: [
      { stageId: "familiarity", responseId: "no-engagement" },
      { stageId: "physical", responseId: "rejected" },
      { stageId: "context-email", responseId: "negative" },
    ],
  },
  {
    id: "s7",
    title: "Not now → timed nurture",
    campaignId: "email-led",
    summary: "A competing priority defers the conversation; the reason is recorded and a return is scheduled.",
    steps: [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "not-now" },
      { stageId: "email-notnow", responseId: "competing" },
    ],
  },
  {
    id: "s8",
    title: "Opt-out → immediate stop",
    campaignId: "email-led",
    summary: "The contact opts out; direct outreach stops and is suppressed at once.",
    steps: [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "opt-out" },
    ],
  },
  {
    id: "s9",
    title: "Wrong contact → correction",
    campaignId: "email-led",
    summary: "A hard bounce halts the route until the contact data is corrected.",
    steps: [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "hard-bounce" },
    ],
  },
  {
    id: "s10",
    title: "Engagement then silence → long-term awareness",
    campaignId: "email-led",
    summary: "A follow-up draws a reply, then the thread goes quiet; follow-ups are capped and nurture continues.",
    steps: [
      { stageId: "prep", responseId: "ready" },
      { stageId: "email", responseId: "opened-no-reply" },
      { stageId: "email-open-followup", responseId: "reply-now" },
      { stageId: "email-question-followup", responseId: "goes-silent" },
    ],
  },
];
