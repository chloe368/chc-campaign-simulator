// ============================================================================
// Core domain types for the CHC Multichannel Campaign Simulator.
// All campaign behaviour is described with these types; visual components hold
// no IF/ELSE campaign logic of their own.
// ============================================================================

export type CampaignId = "email-led" | "social-awareness" | "physical-mail-led";

export type Channel =
  | "preparation"
  | "email"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "paid-social"
  | "website"
  | "content"
  | "phone"
  | "physical"
  | "persona-handoff"
  | "nurture";

export type ResponseStrength =
  | "passive-awareness"
  | "meaningful-engagement"
  | "positive"
  | "timing"
  | "routing"
  | "negative"
  | "stop";

export type OutcomeType =
  | "meeting-booked"
  | "active-conversation"
  | "information-follow-up"
  | "timed-nurture"
  | "new-persona-route"
  | "long-term-awareness"
  | "clean-close"
  | "opt-out"
  | "invalid-contact";

// Ordered awareness ladder. Index conveys progression (higher = further along).
export type AwarenessState =
  | "unaware"
  | "exposed"
  | "recognizes"
  | "interested"
  | "engaged"
  | "active-conversation"
  | "qualified-next-step";

export type EngagementState =
  | "none"
  | "passive-awareness"
  | "meaningful-engagement"
  | "conversation";

export type PersonaRole =
  | "operations"
  | "finance"
  | "executive"
  | "physician"
  | "administrative";

export interface Persona {
  id: string;
  name: string;
  role: PersonaRole;
  title: string;
  // Lower limits for high-sensitivity roles (executive, physician).
  contactPressureLimit: number;
}

export interface AccountProfile {
  id: string;
  organization: string;
  organizationType: string;
  context: string[];
  personas: Persona[];
  primaryPersonaId: string;
  secondPersonaId: string;
  highValue: boolean;
}

// ---------------------------------------------------------------------------
// Effects: the only way a response mutates simulation state.
// ---------------------------------------------------------------------------
export type SimulationEffect =
  | { type: "pause-scheduled-outreach" }
  | { type: "resume-scheduled-outreach" }
  | { type: "change-channel"; channel: Channel }
  | { type: "change-persona"; personaRole: PersonaRole }
  | { type: "set-awareness"; value: AwarenessState }
  | { type: "set-engagement"; value: EngagementState }
  | { type: "schedule-follow-up"; days: number }
  | { type: "record-timing-reason"; reason?: string }
  | { type: "correct-contact" }
  | { type: "suppress-contact" }
  | { type: "reduce-frequency" }
  | { type: "lock-physical" }
  | { type: "add-account-note"; text: string };

export interface NextAction {
  label: string;
  explanation: string;
  channel?: Channel;
  waitDays?: number;
  // Exactly one of the following should resolve where the route goes next.
  nextStageId?: string;
  nextResponseSetId?: string;
  outcomeId?: OutcomeType;
}

export interface ResponseOption {
  id: string;
  label: string;
  description: string; // "meaning"
  strength: ResponseStrength;
  condition: string;
  // Does the main programmed sequence pause on this response?
  pausesCampaign?: boolean;
  changesPersona?: boolean;
  nextAction: NextAction;
  effects: SimulationEffect[];
}

export interface ParallelAction {
  id: string;
  label: string;
  channel: Channel;
  purpose: string;
  startStageId: string;
  stopCondition?: string;
  // "awareness" = can create awareness only; "engagement" = can create a
  // meaningful signal that changes the next main move.
  signalType: "awareness" | "engagement";
}

export interface CampaignStage {
  id: string;
  label: string;
  dayLabel: string;
  channel: Channel;
  objective: string;
  task: string;
  directAction: string;
  parallelActions: ParallelAction[];
  availableResponses: ResponseOption[];
  explanation: string;
  // First stage of a campaign (entry point for the reducer / validator).
  isEntry?: boolean;
}

export interface CampaignOutcome {
  id: OutcomeType;
  label: string;
  type: OutcomeType;
  description: string;
  lesson: string;
}

export interface CampaignDefinition {
  id: CampaignId;
  name: string;
  description: string;
  bestFor: string;
  primaryStrength: string;
  // One-line narrative of what makes this version uniquely strong.
  uniqueStrength: string;
  // The reasoning for why this approach earns engagement (plain language).
  whyItWorks: string[];
  mainChannels: Channel[];
  period: string;
  stages: CampaignStage[];
  outcomes: CampaignOutcome[];
}

// ---------------------------------------------------------------------------
// Runtime simulation session.
// ---------------------------------------------------------------------------
export type EventType =
  | "action"
  | "parallel-action"
  | "response"
  | "wait"
  | "channel-change"
  | "persona-change"
  | "outcome";

export interface SimulationEvent {
  id: string;
  timestamp: string;
  virtualDay: number;
  eventType: EventType;
  stageId: string;
  label: string;
  details: string;
  // Index of the SimulationStep that produced this event (for rewind).
  stepIndex?: number;
}

export interface ScheduledAction {
  id: string;
  label: string;
  dueDay: number;
  channel: Channel;
  active: boolean;
}

export interface SimulationSession {
  id: string;
  campaignId: CampaignId;
  account: AccountProfile;
  currentStageId: string;
  currentPersonaId: string;
  currentChannel: Channel;
  currentDay: number;
  status: "active" | "paused" | "completed";
  awarenessState: AwarenessState;
  engagementState: EngagementState;
  contactPressure: number;
  scheduledOutreachActive: boolean;
  physicalLocked: boolean;
  contactCorrected: boolean;
  history: SimulationEvent[];
  scheduledActions: ScheduledAction[];
  notes: string[];
  timingReason?: string;
  selectedOutcomeId?: OutcomeType;
  // The pending response set the user must answer next (null when at an outcome).
  pendingStageId?: string;
  createdAt: string;
  // Ordered choices, enabling deterministic replay and rewind.
  steps: SimulationStep[];
  // Latest contact-pressure evaluation (derived; stored for the UI).
  pressureWarning: boolean;
}

export interface SimulationStep {
  stageId: string;
  responseId: string;
}
