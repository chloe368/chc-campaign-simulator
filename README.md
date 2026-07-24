# CHC Multichannel Campaign Simulator

An interactive, branch-based simulator that turns three multichannel outreach playbooks into a visual, explorable journey. It is a decision-tree simulator crossed with a campaign-operations dashboard — not a generic sales funnel.

The core operating pattern is always:

> **action → response check → IF/ELSE next move → another response check → a deliberate end state**

Passive signals (opens, views, impressions) are treated as *awareness only*, never intent. Positive replies pause the programmed sequence. Silence is capped — no endless follow-ups. Every path ends deliberately in one of nine defined end states.

---

## The three campaigns

| Campaign | First direct touch | Idea |
| --- | --- | --- |
| **Email-led** | A strong personalized email | Email is the strongest touch; channels change only when the response gives a reason. |
| **Social-awareness** | Five days of social familiarity, *then* email | Build recognition before contact — recognition is not intent. |
| **Physical-mail-led** | A handwritten note + modest gift | Distinction for a high-value account, then digital context and phone routing. |

All three share one rule set and the same nine end states: meeting booked, active conversation, information follow-up, timed nurture, new-persona route, long-term awareness, clean close, opt-out, invalid contact.

---

## Install / run / test

```bash
npm install       # install dependencies
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview the production build
npm test          # run the full Vitest suite (validator + reducer + e2e paths)
npm run typecheck # tsc --noEmit
```

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + `@xyflow/react` (React Flow). No backend. Sessions are stored in `localStorage`.

---

## How it is organized

```
src/
  domain/                    # all campaign logic — no React here
    types.ts                 # data model (campaigns, responses, effects, session)
    campaign-validator.ts    # structural + rule validation
    simulation-reducer.ts    # deterministic replay engine (buildSession + reducer)
    simulation-effects.ts    # applies a response's effects to state
    awareness-rules.ts       # awareness ladder + engagement classification
    pressure-rules.ts        # contact-pressure counting + per-persona limits
    outcome-rules.ts         # end-state labels + meaningful-engagement set
    demo-mode.ts             # seeded PRNG + weighted auto-demo picker
  data/
    campaigns/               # email-led.ts, social-awareness.ts, physical-mail-led.ts
    sample-account.ts        # Harbor Community Health Center (fictional)
    sample-scenarios.ts      # 10 "example account scenarios" (preset walks)
    shared.ts                # standard outcomes + reusable response fragments
  components/                # all visual components (selector, workspace, canvas, …)
  hooks/                     # use-simulation, use-local-storage
  utils/                     # export-session, import-session, format-day
  tests/                     # campaign-validator, simulation-reducer, e2e-scenarios
```

**Design principle:** campaign behaviour lives entirely in the data files and the `domain/` engine. Visual components contain no campaign-specific IF/ELSE — they render whatever the current session and campaign definition describe.

---

## The simulation engine

The engine is fully deterministic. A session is described by an ordered list of `steps` (`{ stageId, responseId }`), and `buildSession(campaignId, account, steps)` **replays** them from the entry stage to reconstruct the entire session — history, awareness/engagement, contact pressure, scheduled actions, notes and the current end state.

Because state is a pure function of the steps:

- **Advancing** appends a step and rebuilds.
- **Rewinding** truncates the steps and rebuilds (so you can explore a different branch).
- **Reset** rebuilds from zero steps.
- **Export/import** round-trips the steps; the imported session is always rebuilt for consistency.

When a response is selected the engine records it, applies its effects, pauses scheduled outreach when required, updates awareness/engagement/channel/persona, schedules any wait, appends events to the activity log, checks contact-pressure limits and checks whether an end state was reached.

---

## Awareness vs. engagement

- **Awareness** = the account has *received or noticed* one relevant touch (an open, a view, an impression, a delivery confirmation, a bare connection accept). Awareness can move timing, channel or message context — it is never a reply.
- **Meaningful engagement** = a reply, a question, an information request, an internal referral, confirmed ownership, a real DM exchange, a phone conversation, confirmed future timing or a booked meeting.

The awareness ladder has seven rungs: *unaware → exposed → recognizes → interested → engaged → active conversation → qualified next step*. No fake numeric probabilities are shown anywhere.

---

## Contact pressure

Each **direct touch** (email, DM, phone call, physical item, action-requiring follow-up) adds one pressure point; passive ads and organic content do not. Limits are per persona (executives and physicians get a lower limit). The account panel shows the counter and warns at the limit; the summary reports whether the route stayed within it.

---

## Simulation modes

1. **Manual** (primary) — you choose every response via the response chooser.
2. **Guided scenarios** — 10 preset "example account scenarios" (illustrations, not predictions).
3. **Auto-demo** — the app picks responses from editable, seeded strength-weights. The seed makes runs reproducible; weights are clearly labelled as demonstration assumptions, not conversion rates. Play, pause and step are supported.

---

## The workflow validator

`validateCampaign()` runs in development (a banner appears in the workspace on any error) and in the test suite. It detects: actions without responses, responses without a next move, invalid next-stage IDs, missing/unreachable outcomes, unreachable stages, dead ends and unbounded cycles, opt-out branches that fail to stop outreach, positive-reply branches that fail to pause, "not now" without timing handling, referral branches without a persona handoff, and physical-rejection branches that route into another physical delivery.

Run it directly with `npm test` (see `src/tests/campaign-validator.test.ts`).

---

## Extending the campaigns

**Add a response to a stage** — push a `ResponseOption` onto the stage's `availableResponses`. Give it a stable `id`, a `strength`, a `description` (its meaning), a `nextAction` that resolves to either `nextStageId` or `outcomeId`, and any `effects`. Run `npm test` — the validator will flag a dead end or missing pause/stop.

**Add a stage** — add a `CampaignStage` (unique `id`, `channel`, `directAction`, `parallelActions`, `availableResponses`) and point some existing response's `nextAction.nextStageId` at it, so it is reachable.

**Add a campaign version** — create a new file in `data/campaigns/`, export a `CampaignDefinition` (one stage must have `isEntry: true`), and register it in `data/campaigns/index.ts`. Add its `CampaignId` to `domain/types.ts`. The selector, workspace, canvas, validator and comparison view pick it up automatically.

---

## Sessions & export

The active session is auto-saved to `localStorage` (`chc-campaign-simulator:session`) and can be resumed from the selector. **Export session JSON** downloads a portable envelope (`{ format, version, exportedAt, session }`); importing it rebuilds the identical run.

---

## The 80% goal

The program's goal is displayed as *"meaningful engagement or positive reply across the selected account set."* The simulator shows how campaign choices shape the route and the account experience; it does not promise the target will be achieved and never counts impressions, single opens, single profile views or delivery confirmations as engagement.

## Assumptions

- The repository was empty, so a fresh Vite + React + TypeScript app was created.
- A single fictional sample account (Harbor Community Health Center) is provided; the app is single-account/single-session, so the aggregate "metrics and reporting" figures are represented through the per-run summary rather than a multi-account roll-up dashboard.
- Screen routing is state-based (selector → workspace → summary → compare) rather than URL-based, to keep the app backend-free and runnable with one command.
