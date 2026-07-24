import type { CampaignDefinition, CampaignStage } from "../../domain/types";
import { STANDARD_OUTCOMES, optOutResponse } from "../shared";

const stages: CampaignStage[] = [
  // ---------------------------------------------------------------- STAGE 0
  {
    id: "social",
    isEntry: true,
    label: "Social familiarity",
    dayLabel: "Day −5 to 0",
    channel: "linkedin",
    objective: "Build a familiar environment before the first email.",
    task: "Appropriate connection/follow request, role-relevant ads, natural content interaction — on the channel the person actually uses.",
    directAction: "Run five days of light social familiarity.",
    explanation:
      "Recognition is built before contact. Recognition must not be mistaken for positive intent — it changes timing and channel, not the fact that no one has replied.",
    parallelActions: [
      { id: "sa-p-email", label: "Prepare Day 1 email", channel: "email", purpose: "Ready the first email on the same account idea.", startStageId: "social", signalType: "awareness" },
      { id: "sa-p-page", label: "Website role page", channel: "website", purpose: "Keep the role page ready.", startStageId: "social", signalType: "awareness" },
      { id: "sa-p-verify", label: "Verify contact data", channel: "preparation", purpose: "Confirm the owner and email.", startStageId: "social", signalType: "awareness" },
      { id: "sa-p-freq", label: "Set frequency limits", channel: "paid-social", purpose: "Cap ad frequency so it stays low-pressure.", startStageId: "social", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "connection-accepted", label: "Connection accepted", description: "Accepted a request — recognition, not a relationship.", strength: "passive-awareness", condition: "Accepts connection.", nextAction: { label: "Send the aligned Day 1 email", explanation: "Keep the email on the same topic; do not claim a relationship.", channel: "email", waitDays: 1, nextStageId: "email" }, effects: [{ type: "set-awareness", value: "recognizes" }] },
      { id: "dm-received", label: "DM received", description: "They started a real message.", strength: "meaningful-engagement", condition: "Inbound DM.", pausesCampaign: true, nextAction: { label: "Answer; pause scheduled action", explanation: "If a real conversation begins, pause scheduled direct action and answer.", outcomeId: "active-conversation" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-engagement", value: "conversation" }, { type: "set-awareness", value: "active-conversation" }] },
      { id: "ad-opened", label: "Ad link opened", description: "Clicked a role-relevant ad — stronger awareness.", strength: "passive-awareness", condition: "Ad click.", nextAction: { label: "Send an aligned Day 1 email", explanation: "Keep Day 1 relevant to that topic; do not mention tracking.", channel: "email", waitDays: 1, nextStageId: "email" }, effects: [{ type: "set-awareness", value: "recognizes" }] },
      { id: "content-reaction", label: "Meaningful content reaction", description: "A substantive reaction to content.", strength: "meaningful-engagement", condition: "Real interaction.", nextAction: { label: "Respond, use topic in Day 1 email", explanation: "Respond naturally and carry the active topic into Day 1.", channel: "email", waitDays: 1, nextStageId: "email" }, effects: [{ type: "set-engagement", value: "meaningful-engagement" }, { type: "set-awareness", value: "interested" }] },
      { id: "no-signal", label: "No signal", description: "No visible response to the familiarity.", strength: "passive-awareness", condition: "Nothing observable.", nextAction: { label: "Still send a simple Day 1 email", explanation: "Send the email; keep it simple; do not overstate familiarity.", channel: "email", waitDays: 1, nextStageId: "email" }, effects: [{ type: "set-awareness", value: "exposed" }] },
      { id: "negative-feedback", label: "Negative feedback", description: "A negative reaction to the social activity.", strength: "negative", condition: "Negative signal.", nextAction: { label: "Reduce exposure, review relevance", explanation: "Reduce or stop exposure and review whether the campaign fits.", outcomeId: "clean-close" }, effects: [{ type: "reduce-frequency" }, { type: "add-account-note", text: "Negative social feedback — exposure reduced." }] },
      { id: "contact-changed", label: "Contact changed / left", description: "The owner has moved or changed.", strength: "routing", condition: "Owner changed.", nextAction: { label: "Correct owner before Day 1", explanation: "Fix the route before sending anything.", outcomeId: "invalid-contact" }, effects: [{ type: "correct-contact" }] },
    ],
  },

  // ---------------------------------------------------------------- STAGE 1
  {
    id: "email",
    label: "First email",
    dayLabel: "Day 1",
    channel: "email",
    objective: "Send the first email using the same account idea present in the social environment.",
    task: "Keep ads and content running at controlled frequency; no new unrelated message.",
    directAction: "Send the first email.",
    explanation:
      "The email lands inside a familiar environment — but a positive reply, not recognition, is what advances the route.",
    parallelActions: [
      { id: "sa-e-ads", label: "Ads at controlled frequency", channel: "paid-social", purpose: "Reinforce without pressure.", startStageId: "email", stopCondition: "Positive reply or opt-out", signalType: "awareness" },
      { id: "sa-e-log", label: "Signal logging", channel: "linkedin", purpose: "Record social signals as awareness.", startStageId: "email", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "positive", label: "Positive", description: "A genuine positive reply.", strength: "positive", condition: "Positive reply.", pausesCampaign: true, nextAction: { label: "Pause and move to conversation", explanation: "Pause the sequence and reply as a human.", outcomeId: "active-conversation" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-awareness", value: "active-conversation" }, { type: "set-engagement", value: "conversation" }] },
      { id: "question", label: "Question", description: "Interested, asks something.", strength: "meaningful-engagement", condition: "Question.", pausesCampaign: true, nextAction: { label: "Answer, request one asset if asked", explanation: "Answer precisely; if they want detail, send one asset and agree a date.", outcomeId: "information-follow-up" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-engagement", value: "meaningful-engagement" }, { type: "set-awareness", value: "interested" }] },
      { id: "opened-no-reply", label: "Opened, no reply", description: "Awareness, not engagement.", strength: "passive-awareness", condition: "Open, no reply.", nextAction: { label: "Wait two days, one follow-up", explanation: "Then continue on the strongest active social channel.", waitDays: 2, nextStageId: "active-social" }, effects: [{ type: "set-awareness", value: "exposed" }] },
      { id: "not-opened", label: "Not opened", description: "No open.", strength: "passive-awareness", condition: "No open.", nextAction: { label: "Move to LinkedIn", explanation: "Change channel to the active social route.", channel: "linkedin", nextStageId: "active-social" }, effects: [{ type: "change-channel", channel: "linkedin" }] },
      { id: "click", label: "Click", description: "Clicked a link.", strength: "passive-awareness", condition: "Tracked click.", nextAction: { label: "Use strongest active channel next", explanation: "A social signal exists — follow up on that channel.", channel: "linkedin", nextStageId: "active-social" }, effects: [{ type: "set-awareness", value: "recognizes" }] },
      { id: "negative", label: "Negative", description: "A no.", strength: "negative", condition: "Declines.", nextAction: { label: "Reduce social pressure too", explanation: "Reduce social pressure as well as direct outreach, then classify.", nextStageId: "sa-negative" }, effects: [{ type: "reduce-frequency" }] },
      { id: "referral", label: "Referral", description: "Points to another owner.", strength: "routing", condition: "Names someone.", changesPersona: true, nextAction: { label: "New-persona route", explanation: "Handoff with the same account story.", outcomeId: "new-persona-route" }, effects: [{ type: "change-persona", personaRole: "finance" }] },
      { id: "not-now", label: "Not now", description: "Wrong timing.", strength: "timing", condition: "Defers.", pausesCampaign: true, nextAction: { label: "Record reason, timed nurture", explanation: "Pause and return with a new angle later.", outcomeId: "timed-nurture" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "record-timing-reason" }, { type: "schedule-follow-up", days: 30 }] },
      { id: "delivery-issue", label: "Delivery issue", description: "Bounce or delivery failure.", strength: "routing", condition: "Delivery failure.", nextAction: { label: "Correct before continuing", explanation: "Fix the address; resume after correction.", outcomeId: "invalid-contact" }, effects: [{ type: "correct-contact" }] },
      optOutResponse(),
    ],
  },

  {
    id: "sa-negative",
    label: "Classify the negative reply",
    dayLabel: "Day 1–2",
    channel: "email",
    objective: "Understand the kind of no and reduce all pressure.",
    task: "Acknowledge; clarify once only if a misunderstanding.",
    directAction: "Pick the subtype.",
    explanation: "Reduce social and direct pressure together, then choose the route.",
    parallelActions: [],
    availableResponses: [
      { id: "wrong-role", label: "Wrong role", description: "Not their remit.", strength: "routing", condition: "Wrong owner.", changesPersona: true, nextAction: { label: "New-persona route", explanation: "Same story, right owner.", outcomeId: "new-persona-route" }, effects: [{ type: "change-persona", personaRole: "finance" }] },
      { id: "timing", label: "Timing / budget", description: "Not now.", strength: "timing", condition: "Timing objection.", nextAction: { label: "Timed nurture", explanation: "Record reason, return later.", outcomeId: "timed-nurture" }, effects: [{ type: "record-timing-reason" }, { type: "schedule-follow-up", days: 30 }] },
      { id: "no-priority", label: "No priority", description: "Not important.", strength: "negative", condition: "Declines.", nextAction: { label: "Clean close", explanation: "Acknowledge and close cleanly.", outcomeId: "clean-close" }, effects: [] },
      { id: "do-not-contact", label: "Do not contact", description: "Explicit stop.", strength: "stop", condition: "Stop request.", nextAction: { label: "Opt-out", explanation: "Suppress immediately.", outcomeId: "opt-out" }, effects: [{ type: "suppress-contact" }] },
    ],
  },

  // ---------------------------------------------------------------- STAGE 2
  {
    id: "active-social",
    label: "Active social channel",
    dayLabel: "Day 3–5",
    channel: "linkedin",
    objective: "Send a short DM on the person's active channel.",
    task: "Short DM after no open, no reply, a useful signal, a referral, or a connection acceptance.",
    directAction: "Send one short DM.",
    explanation:
      "Default to LinkedIn; use another channel only when it is clearly the person's active route. No repeated connection requests.",
    parallelActions: [
      { id: "sa-as-ads", label: "Continue relevant ads", channel: "paid-social", purpose: "Reinforce at low frequency.", startStageId: "active-social", stopCondition: "Positive reply or opt-out", signalType: "awareness" },
      { id: "sa-as-content", label: "Organic content", channel: "content", purpose: "Keep topical content visible.", startStageId: "active-social", signalType: "awareness" },
      { id: "sa-as-proof", label: "Proof content ready", channel: "website", purpose: "Keep proof aligned and ready.", startStageId: "active-social", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "replied", label: "Seen and replied", description: "A real reply.", strength: "positive", condition: "Positive DM reply.", pausesCampaign: true, nextAction: { label: "Follow the response branch", explanation: "Positive, query, referral, timing or negative.", outcomeId: "active-conversation" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-awareness", value: "active-conversation" }, { type: "set-engagement", value: "conversation" }] },
      { id: "seen-no-reply", label: "Seen, no reply", description: "Read, not answered.", strength: "passive-awareness", condition: "Seen, silent.", nextAction: { label: "One follow-up, then stop the DM", explanation: "Wait one day, one follow-up, then stop repeating the DM.", waitDays: 1, nextStageId: "route-change" }, effects: [{ type: "set-awareness", value: "exposed" }] },
      { id: "not-seen", label: "Not seen", description: "No sign it was read.", strength: "passive-awareness", condition: "Unseen.", nextAction: { label: "Switch to best-fit channel", explanation: "Move to the channel the person actually uses, then route change.", nextStageId: "route-change" }, effects: [] },
      { id: "referral", label: "Referral", description: "Points to another owner.", strength: "routing", condition: "Names someone.", changesPersona: true, nextAction: { label: "New-persona route", explanation: "Handoff, same story.", outcomeId: "new-persona-route" }, effects: [{ type: "change-persona", personaRole: "finance" }] },
      { id: "decline", label: "Decline", description: "A no.", strength: "negative", condition: "Declines.", nextAction: { label: "Stop or nurture by reason", explanation: "Classify and choose.", nextStageId: "sa-negative" }, effects: [] },
      { id: "passive-activity", label: "Passive social activity", description: "Views/reactions only.", strength: "passive-awareness", condition: "Passive only.", nextAction: { label: "Keep as awareness", explanation: "Do not treat as a reply; continue toward the route change.", nextStageId: "route-change" }, effects: [{ type: "set-awareness", value: "recognizes" }] },
      optOutResponse(),
    ],
  },

  // ---------------------------------------------------------------- STAGE 3
  {
    id: "route-change",
    label: "Follow-up or route change",
    dayLabel: "Day 5–7",
    channel: "linkedin",
    objective: "One further direct digital touch, then a pause.",
    task: "Facebook DM only when Facebook is genuinely used; otherwise stay on the most active channel.",
    directAction: "Send one further digital touch.",
    explanation: "Only one more direct digital touch — then a one-week pause before phone. Lower paid frequency while direct contact is active.",
    parallelActions: [
      { id: "sa-rc-content", label: "Relevant website content", channel: "website", purpose: "Keep content relevant.", startStageId: "route-change", signalType: "awareness" },
      { id: "sa-rc-paid", label: "Lower paid frequency", channel: "paid-social", purpose: "Reduce ad frequency during direct contact.", startStageId: "route-change", stopCondition: "Direct contact active", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "reply", label: "Reply", description: "Drew a response.", strength: "positive", condition: "Any reply.", pausesCampaign: true, nextAction: { label: "Follow the response branch", explanation: "Route by the reply.", outcomeId: "active-conversation" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-engagement", value: "meaningful-engagement" }] },
      { id: "no-reply", label: "No reply", description: "Silence.", strength: "passive-awareness", condition: "No response.", nextAction: { label: "Pause one week, then phone", explanation: "Pause for one week before the confirming call.", channel: "phone", waitDays: 7, nextStageId: "phone" }, effects: [{ type: "change-channel", channel: "phone" }] },
      { id: "repeated-passive", label: "Repeated passive awareness", description: "More views, no reply.", strength: "passive-awareness", condition: "Passive only.", nextAction: { label: "Wait before phone", explanation: "Do not add more messages; wait, then phone.", channel: "phone", waitDays: 7, nextStageId: "phone" }, effects: [{ type: "set-awareness", value: "exposed" }] },
      optOutResponse(),
    ],
  },

  // ---------------------------------------------------------------- STAGE 4
  {
    id: "phone",
    label: "Phone",
    dayLabel: "After one-week pause",
    channel: "phone",
    objective: "Confirm ownership and timing.",
    task: "A short confirming call.",
    directAction: "Place the call.",
    explanation: "The call confirms the owner and whether the topic belongs with them now.",
    parallelActions: [
      { id: "sa-ph-persona", label: "Second-persona route ready", channel: "persona-handoff", purpose: "Ready an alternate owner.", startStageId: "phone", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "right-positive", label: "Right person and positive", description: "Correct owner, open.", strength: "positive", condition: "Positive on call.", pausesCampaign: true, nextAction: { label: "Meeting", explanation: "Agree the next step.", outcomeId: "meeting-booked" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-awareness", value: "qualified-next-step" }] },
      { id: "right-not-now", label: "Right person but not now", description: "Correct owner, wrong timing.", strength: "timing", condition: "Defers.", nextAction: { label: "Timed nurture", explanation: "Record reason and return date.", outcomeId: "timed-nurture" }, effects: [{ type: "record-timing-reason" }, { type: "schedule-follow-up", days: 30 }] },
      { id: "wrong-contact", label: "Wrong contact", description: "Not the owner.", strength: "routing", condition: "Points elsewhere.", changesPersona: true, nextAction: { label: "New-persona route", explanation: "Correct and handoff.", outcomeId: "new-persona-route" }, effects: [{ type: "correct-contact" }, { type: "change-persona", personaRole: "finance" }] },
      { id: "information-request", label: "Information request", description: "Asks for one item.", strength: "meaningful-engagement", condition: "Requests asset.", nextAction: { label: "Information follow-up", explanation: "Send one item, set a date.", outcomeId: "information-follow-up" }, effects: [{ type: "set-engagement", value: "meaningful-engagement" }] },
      { id: "no-answer", label: "No answer / voicemail", description: "No pickup.", strength: "passive-awareness", condition: "Unanswered.", nextAction: { label: "One email, then pause", explanation: "Leave one short voicemail, one final email, then pause.", outcomeId: "timed-nurture" }, effects: [{ type: "schedule-follow-up", days: 10 }] },
      { id: "referral", label: "Referral", description: "Points to another owner.", strength: "routing", condition: "Names someone.", changesPersona: true, nextAction: { label: "New-persona route", explanation: "Handoff, same story.", outcomeId: "new-persona-route" }, effects: [{ type: "change-persona", personaRole: "finance" }] },
      { id: "negative", label: "Negative", description: "A no.", strength: "negative", condition: "Declines.", nextAction: { label: "Clean close", explanation: "Understand the reason; close cleanly.", outcomeId: "clean-close" }, effects: [] },
      optOutResponse(),
    ],
  },
];

export const socialAwarenessCampaign: CampaignDefinition = {
  id: "social-awareness",
  name: "Social-awareness campaign",
  description:
    "Five days of social familiarity, relevant ads and natural content interaction make the account more familiar with the sender and topic before the first direct email.",
  bestFor: "Accounts where direct contact is possible but recognition needs to be built first.",
  primaryStrength: "Recognition before contact",
  uniqueStrength:
    "The first email is never cold. Five days of familiar, relevant presence mean the sender and the topic are already recognised, so the same message that would be ignored from a stranger gets opened and answered from someone the account has seen.",
  whyItWorks: [
    "Warm before the ask: connection, relevant ads and natural content interaction build recognition first, lifting the odds the first email is opened and read.",
    "Meets people where they are: activity stays on the channel the person actually uses, so familiarity feels natural rather than staged.",
    "Recognition is not mistaken for intent: opens, views and accepted connections only shape timing and channel — a reply is still what advances the account.",
    "Layered reinforcement: ads and content keep the topic present in parallel, so each direct touch lands in an already-familiar context instead of starting from zero.",
  ],
  mainChannels: ["linkedin", "paid-social", "email", "phone"],
  period: "Day −5 to 14",
  stages,
  outcomes: STANDARD_OUTCOMES,
};
