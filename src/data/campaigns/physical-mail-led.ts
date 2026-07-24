import type { CampaignDefinition, CampaignStage } from "../../domain/types";
import { STANDARD_OUTCOMES, optOutResponse } from "../shared";

const stages: CampaignStage[] = [
  // ---------------------------------------------------------------- STAGE 0
  {
    id: "familiarity",
    isEntry: true,
    label: "Light familiarity",
    dayLabel: "Day −5 to 0",
    channel: "linkedin",
    objective: "Build light recognition and verify the physical route.",
    task: "Connection/follow request, relevant ads, natural content interaction; verify office address and assistant route.",
    directAction: "Prepare the route and the handwritten note.",
    explanation:
      "The handwritten note and modest gift must be thoughtful, modest and clearly tied to one account idea. Value comes from relevance, not cost. Never use guilt language.",
    parallelActions: [
      { id: "pm-p-note", label: "Prepare handwritten note", channel: "physical", purpose: "Write a personal note tied to one account idea.", startStageId: "familiarity", signalType: "awareness" },
      { id: "pm-p-gift", label: "Prepare modest gift", channel: "physical", purpose: "Choose a modest, relevant gesture.", startStageId: "familiarity", signalType: "awareness" },
      { id: "pm-p-value", label: "Confirm high value", channel: "preparation", purpose: "Confirm the account is worth the physical route.", startStageId: "familiarity", signalType: "awareness" },
      { id: "pm-p-policy", label: "Confirm no office-policy restriction", channel: "preparation", purpose: "Check gifts are allowed before sending.", startStageId: "familiarity", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "social-engagement", label: "Social engagement exists", description: "Some light recognition already.", strength: "passive-awareness", condition: "Existing social signal.", nextAction: { label: "Align the note, then deliver", explanation: "Keep the physical note aligned to the same account idea.", channel: "physical", waitDays: 1, nextStageId: "physical" }, effects: [{ type: "set-awareness", value: "recognizes" }] },
      { id: "no-engagement", label: "No social engagement", description: "No recognition yet.", strength: "passive-awareness", condition: "No signal.", nextAction: { label: "Proceed only if verified & high value", explanation: "Proceed only when the account remains high value and the route is verified.", channel: "physical", waitDays: 1, nextStageId: "physical" }, effects: [{ type: "set-awareness", value: "exposed" }] },
      { id: "negative-social", label: "Negative social feedback", description: "A negative reaction.", strength: "negative", condition: "Negative signal.", nextAction: { label: "Reduce exposure, reassess physical", explanation: "Reduce exposure and reassess the physical route.", outcomeId: "clean-close" }, effects: [{ type: "reduce-frequency" }, { type: "add-account-note", text: "Negative social feedback — physical route reassessed." }] },
      { id: "contact-changes", label: "Contact changes", description: "Owner changed.", strength: "routing", condition: "Owner moved.", nextAction: { label: "Correct route before delivery", explanation: "Fix the route before sending anything physical.", outcomeId: "invalid-contact" }, effects: [{ type: "correct-contact" }] },
    ],
  },

  // ---------------------------------------------------------------- STAGE 1
  {
    id: "physical",
    label: "Physical delivery",
    dayLabel: "Day 1",
    channel: "physical",
    objective: "Deliver a personalized note and modest gift.",
    task: "Handwritten note, modest gift, one relevant physical brief when needed. Keep digital quiet.",
    directAction: "Send or deliver the physical gesture.",
    explanation:
      "Reserved for senior executives, influential clinical leaders and high-value accounts with a strong account-specific idea. Do not create immediate digital pressure.",
    parallelActions: [
      { id: "pm-ph-quiet", label: "Keep ads and content quiet", channel: "paid-social", purpose: "Avoid digital pressure around the delivery.", startStageId: "physical", signalType: "awareness" },
      { id: "pm-ph-record", label: "Record delivery & routing", channel: "preparation", purpose: "Log who accepted and how it routed.", startStageId: "physical", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "accepted-person", label: "Accepted by intended person", description: "Reached the target directly.", strength: "passive-awareness", condition: "Target received it.", nextAction: { label: "Move to Day 2 context email", explanation: "Provide context without pressure.", channel: "email", waitDays: 1, nextStageId: "context-email" }, effects: [{ type: "set-awareness", value: "recognizes" }] },
      { id: "accepted-assistant", label: "Accepted by assistant", description: "An assistant took delivery.", strength: "passive-awareness", condition: "Assistant received it.", nextAction: { label: "Confirm recipient, then context email", explanation: "One-sentence relevance to the assistant, then the context email.", channel: "email", waitDays: 1, nextStageId: "context-email" }, effects: [{ type: "set-awareness", value: "exposed" }, { type: "add-account-note", text: "Delivery accepted by assistant." }] },
      { id: "accepted-frontdesk", label: "Accepted by front desk", description: "Front desk took it; unclear routing.", strength: "passive-awareness", condition: "Front desk received it.", nextAction: { label: "Confirm routing before assuming receipt", explanation: "Record who accepted it; do not assume the target received it. Use a low-pressure context email.", channel: "email", waitDays: 1, nextStageId: "context-email" }, effects: [{ type: "set-awareness", value: "exposed" }, { type: "add-account-note", text: "Front desk accepted — routing unconfirmed." }] },
      { id: "redirected", label: "Redirected", description: "Pointed to a different owner.", strength: "routing", condition: "Redirected to another owner.", changesPersona: true, nextAction: { label: "Tailor Day 2 email for that owner", explanation: "Confirm the correct owner and tailor the context email.", channel: "email", waitDays: 1, nextStageId: "context-email" }, effects: [{ type: "change-persona", personaRole: "finance" }] },
      { id: "rejected", label: "Rejected", description: "Office policy declined the gesture.", strength: "negative", condition: "Rejected by policy.", nextAction: { label: "Stop physical; digital only if appropriate", explanation: "Respect office policy; stop further physical attempts and move to a digital route only when appropriate.", channel: "email", waitDays: 1, nextStageId: "context-email" }, effects: [{ type: "lock-physical" }, { type: "add-account-note", text: "Physical rejected — no further physical attempts." }] },
      { id: "wrong-address", label: "Wrong address", description: "Delivery address invalid.", strength: "routing", condition: "Bad address.", nextAction: { label: "Correct data before continuing", explanation: "Do not continue until the address is verified.", outcomeId: "invalid-contact" }, effects: [{ type: "correct-contact" }] },
      { id: "person-left", label: "Person left organization", description: "The target has moved on.", strength: "routing", condition: "Owner departed.", changesPersona: true, nextAction: { label: "Identify successor, rebuild route", explanation: "Find the successor and rebuild the route.", outcomeId: "new-persona-route" }, effects: [{ type: "change-persona", personaRole: "executive" }] },
    ],
  },

  // ---------------------------------------------------------------- STAGE 2
  {
    id: "context-email",
    label: "Context email",
    dayLabel: "Day 2",
    channel: "email",
    objective: "Explain why the gesture was sent — without pressure.",
    task: "Offer a digital copy, one-sentence relevance, a low-pressure next step.",
    directAction: "Send the context email.",
    explanation:
      'Never write "Did you read it?", "Did you receive my gift?" or "I hope you noticed the package." Give context, not pressure.',
    parallelActions: [
      { id: "pm-ce-page", label: "Role page ready", channel: "website", purpose: "Keep the role page ready.", startStageId: "context-email", signalType: "awareness" },
      { id: "pm-ce-copy", label: "Digital copy ready", channel: "content", purpose: "Keep a digital copy available.", startStageId: "context-email", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "positive", label: "Positive", description: "Warm, ready to talk.", strength: "positive", condition: "Positive reply.", pausesCampaign: true, nextAction: { label: "Schedule or continue", explanation: "Pause the sequence and continue as a conversation.", outcomeId: "active-conversation" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-awareness", value: "active-conversation" }, { type: "set-engagement", value: "conversation" }] },
      { id: "query", label: "Query", description: "Asks a question.", strength: "meaningful-engagement", condition: "Question.", pausesCampaign: true, nextAction: { label: "Answer, share one item", explanation: "Answer the exact question, share one relevant item, continue on the reply.", outcomeId: "information-follow-up" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-engagement", value: "meaningful-engagement" }, { type: "set-awareness", value: "interested" }] },
      { id: "negative", label: "Negative", description: "A no.", strength: "negative", condition: "Declines.", nextAction: { label: "Clarify once, else close or nurture", explanation: "Clarify once only if a misunderstanding; otherwise close or nurture.", outcomeId: "clean-close" }, effects: [] },
      { id: "received-not-reviewed", label: "Received but not reviewed", description: "Has it, has not looked.", strength: "passive-awareness", condition: "Acknowledged, not reviewed.", nextAction: { label: "Remove pressure, one-sentence summary", explanation: "Give a one-sentence summary, offer the digital copy, and wait.", waitDays: 2, nextStageId: "linkedin" }, effects: [{ type: "set-awareness", value: "recognizes" }] },
      { id: "did-not-receive", label: "Did not receive", description: "Never got it.", strength: "routing", condition: "No receipt.", nextAction: { label: "Confirm routing, offer digital copy", explanation: "Confirm the office route and offer the digital copy.", waitDays: 1, nextStageId: "linkedin" }, effects: [{ type: "add-account-note", text: "Delivery not received — routing confirmed." }] },
      { id: "opened-no-reply", label: "Opened, no reply", description: "Read the email, no reply.", strength: "passive-awareness", condition: "Open, no reply.", nextAction: { label: "Wait two days, follow up once", explanation: "One follow-up, then move to LinkedIn.", waitDays: 2, nextStageId: "linkedin" }, effects: [{ type: "set-awareness", value: "exposed" }] },
      { id: "not-opened", label: "Not opened", description: "No open.", strength: "passive-awareness", condition: "No open.", nextAction: { label: "Move to LinkedIn DM", explanation: "Change channel to LinkedIn.", channel: "linkedin", nextStageId: "linkedin" }, effects: [{ type: "change-channel", channel: "linkedin" }] },
      { id: "referral", label: "Referral", description: "Points to another owner.", strength: "routing", condition: "Names someone.", changesPersona: true, nextAction: { label: "New-persona route", explanation: "Handoff, same story.", outcomeId: "new-persona-route" }, effects: [{ type: "change-persona", personaRole: "finance" }] },
      optOutResponse(),
    ],
  },

  // ---------------------------------------------------------------- STAGE 3
  {
    id: "linkedin",
    label: "LinkedIn",
    dayLabel: "Day 4–6",
    channel: "linkedin",
    objective: "One short DM using the same account idea as the physical note.",
    task: "Use after no open, no reply, package redirection, or a relevant social signal.",
    directAction: "Send one short DM.",
    explanation: "Keep the account idea consistent with the physical note; one considered DM, not a barrage.",
    parallelActions: [
      { id: "pm-li-copy", label: "Digital copy", channel: "content", purpose: "Keep the digital copy available.", startStageId: "linkedin", signalType: "awareness" },
      { id: "pm-li-content", label: "Matching content", channel: "content", purpose: "Keep content aligned with the note.", startStageId: "linkedin", signalType: "awareness" },
      { id: "pm-li-notes", label: "Delivery notes", channel: "preparation", purpose: "Keep routing notes current.", startStageId: "linkedin", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "replied", label: "Seen and replied", description: "A real reply.", strength: "positive", condition: "Positive reply.", pausesCampaign: true, nextAction: { label: "Follow the response branch", explanation: "Positive, query, referral or negative.", outcomeId: "active-conversation" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-awareness", value: "active-conversation" }, { type: "set-engagement", value: "conversation" }] },
      { id: "seen-no-reply", label: "Seen, no reply", description: "Read, not answered.", strength: "passive-awareness", condition: "Seen, silent.", nextAction: { label: "Wait two days, then call", explanation: "Move toward the confirming call.", channel: "phone", waitDays: 2, nextStageId: "final-digital" }, effects: [{ type: "set-awareness", value: "exposed" }] },
      { id: "not-seen", label: "Not seen", description: "No sign it was read.", strength: "passive-awareness", condition: "Unseen.", nextAction: { label: "Facebook only if relevant, then call", explanation: "Facebook only when relevant; then move to the final digital touch.", nextStageId: "final-digital" }, effects: [] },
      { id: "referral", label: "Referral", description: "Points to another owner.", strength: "routing", condition: "Names someone.", changesPersona: true, nextAction: { label: "New-persona route", explanation: "Handoff, same story.", outcomeId: "new-persona-route" }, effects: [{ type: "change-persona", personaRole: "finance" }] },
      { id: "negative", label: "Negative", description: "A no.", strength: "negative", condition: "Declines.", nextAction: { label: "Close or nurture by reason", explanation: "Understand the reason and choose.", outcomeId: "clean-close" }, effects: [] },
      optOutResponse(),
    ],
  },

  // ---------------------------------------------------------------- STAGE 4
  {
    id: "final-digital",
    label: "Final digital",
    dayLabel: "Day 6–8",
    channel: "linkedin",
    objective: "One final digital touch before phone.",
    task: "Facebook or LinkedIn follow-up — used once. Do not keep adding messages.",
    directAction: "Send the final digital touch.",
    explanation: "One consistent account story; then phone. No endless messages.",
    parallelActions: [
      { id: "pm-fd-story", label: "Maintain one account story", channel: "content", purpose: "Keep the narrative consistent.", startStageId: "final-digital", signalType: "awareness" },
      { id: "pm-fd-phone", label: "Prepare phone route", channel: "phone", purpose: "Ready the confirming call.", startStageId: "final-digital", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "reply", label: "Reply", description: "Drew a response.", strength: "positive", condition: "Any reply.", pausesCampaign: true, nextAction: { label: "Follow the response branch", explanation: "Route by the reply.", outcomeId: "active-conversation" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-engagement", value: "meaningful-engagement" }] },
      { id: "no-reply", label: "No reply", description: "Silence.", strength: "passive-awareness", condition: "No response.", nextAction: { label: "Move to phone", explanation: "Change channel to the confirming call.", channel: "phone", waitDays: 1, nextStageId: "phone" }, effects: [{ type: "change-channel", channel: "phone" }] },
      optOutResponse(),
    ],
  },

  // ---------------------------------------------------------------- STAGE 5
  {
    id: "phone",
    label: "Phone",
    dayLabel: "Day 8–12",
    channel: "phone",
    objective: "Confirm owner, delivery route and current relevance.",
    task: "A short confirming call. Stop physical attempts after rejection.",
    directAction: "Place the call.",
    explanation: "Confirm the correct owner, the delivery route and whether the topic belongs now.",
    parallelActions: [
      { id: "pm-ph-email", label: "Concise follow-up email ready", channel: "email", purpose: "Ready one concise follow-up email.", startStageId: "phone", signalType: "awareness" },
      { id: "pm-ph-persona", label: "Second-persona route", channel: "persona-handoff", purpose: "Ready an alternate owner route.", startStageId: "phone", signalType: "awareness" },
    ],
    availableResponses: [
      { id: "right-positive", label: "Right person and positive", description: "Correct owner, open.", strength: "positive", condition: "Positive on call.", pausesCampaign: true, nextAction: { label: "Schedule", explanation: "Agree the meeting.", outcomeId: "meeting-booked" }, effects: [{ type: "pause-scheduled-outreach" }, { type: "set-awareness", value: "qualified-next-step" }] },
      { id: "right-curious", label: "Right person and curious", description: "Correct owner, wants detail.", strength: "meaningful-engagement", condition: "Curious on call.", nextAction: { label: "Send material, agree next step", explanation: "Answer briefly, send requested material, agree a next step.", outcomeId: "information-follow-up" }, effects: [{ type: "set-engagement", value: "meaningful-engagement" }] },
      { id: "wrong-contact", label: "Wrong contact", description: "Not the owner.", strength: "routing", condition: "Points elsewhere.", changesPersona: true, nextAction: { label: "Correct route, new-persona workflow", explanation: "Correct the route and hand off.", outcomeId: "new-persona-route" }, effects: [{ type: "correct-contact" }, { type: "change-persona", personaRole: "finance" }] },
      { id: "negative", label: "Negative", description: "A no.", strength: "negative", condition: "Declines.", nextAction: { label: "Stay in touch only when welcome", explanation: "Understand the reason; close cleanly.", outcomeId: "clean-close" }, effects: [] },
      { id: "no-answer", label: "No answer / voicemail", description: "No pickup.", strength: "passive-awareness", condition: "Unanswered.", nextAction: { label: "One email, then pause", explanation: "Leave one short message, one email, then pause.", outcomeId: "timed-nurture" }, effects: [{ type: "schedule-follow-up", days: 10 }] },
      { id: "call-later", label: "Call later", description: "Asks to be called back.", strength: "timing", condition: "Defers.", nextAction: { label: "Timed nurture", explanation: "Record the date and hold.", outcomeId: "timed-nurture" }, effects: [{ type: "record-timing-reason", reason: "Call-back requested." }, { type: "schedule-follow-up", days: 7 }] },
      optOutResponse(),
    ],
  },
];

export const physicalMailLedCampaign: CampaignDefinition = {
  id: "physical-mail-led",
  name: "Physical-mail-led campaign",
  description:
    "A thoughtful handwritten note and modest physical gesture create distinction for a high-value account. Email, social routes and phone then provide context and confirm ownership.",
  bestFor: "Senior or influential people at strategically important accounts.",
  primaryStrength: "Distinction and memorability",
  uniqueStrength:
    "It stands out where digital cannot. A senior leader ignores another email but remembers a thoughtful handwritten note. The physical gesture creates distinction and permission; email and phone then simply provide context and confirm ownership.",
  whyItWorks: [
    "Pattern interrupt: a modest, personal, relevant gesture cuts through an inbox a senior leader never fully reads — its value comes from relevance, not cost.",
    "Distinction earns a hearing: because it is memorable and rare, the follow-up context email is opened by someone who already knows why it arrived.",
    "Respectful by design: no guilt language, never asking 'did you read it', and no second physical attempt after a rejection — which protects the relationship at the top of the account.",
    "Routing built in: assistant and front-desk handling is expected, so a redirected package becomes a confirmed owner rather than a dead end.",
  ],
  mainChannels: ["physical", "email", "linkedin", "phone"],
  period: "Day −5 to 12",
  stages,
  outcomes: STANDARD_OUTCOMES,
};
