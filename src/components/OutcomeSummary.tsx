import type { CampaignDefinition, SimulationSession } from "../domain/types";
import { getStage } from "../data/campaigns";
import { currentPressureLimit } from "../domain/pressure-rules";
import { isMeaningfulOutcome, outcomeTone } from "../domain/outcome-rules";
import { ChannelBadge } from "./ui";
import { OUTCOME_COLOR } from "./channel-meta";

interface Props {
  campaign: CampaignDefinition;
  session: SimulationSession;
  onRestart: () => void;
  onDifferentResponse: () => void;
  onCompare: () => void;
  onExport: () => void;
  onBack: () => void;
}

export function OutcomeSummary({ campaign, session, onRestart, onDifferentResponse, onCompare, onExport, onBack }: Props) {
  const outcome = campaign.outcomes.find((o) => o.id === session.selectedOutcomeId);
  const tone = session.selectedOutcomeId ? outcomeTone(session.selectedOutcomeId) : "neutral";
  const color = session.selectedOutcomeId ? OUTCOME_COLOR[session.selectedOutcomeId] : "#0d9488";

  const channelsUsed = Array.from(new Set(session.steps.map((s) => getStage(campaign, s.stageId).channel)));
  const directTouches = session.contactPressure;
  const limit = currentPressureLimit(session, session.account);
  const personaChanges = session.history.filter((e) => e.eventType === "persona-change");
  const waits = session.history.filter((e) => e.eventType === "wait");
  const parallels = Array.from(
    new Set(session.steps.flatMap((s) => getStage(campaign, s.stageId).parallelActions.map((p) => p.label))),
  );

  // Where engagement was created / momentum lost.
  const engagementPoints = session.steps
    .map((s) => getStage(campaign, s.stageId).availableResponses.find((r) => r.id === s.responseId))
    .filter((r) => r && (r.strength === "positive" || r.strength === "meaningful-engagement"))
    .map((r) => r!.label);
  const momentumLoss = session.steps
    .map((s) => getStage(campaign, s.stageId).availableResponses.find((r) => r.id === s.responseId))
    .filter((r) => r && (r.strength === "passive-awareness" || r.strength === "negative"))
    .map((r) => r!.label);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button className="text-sm text-ink/50 hover:text-ink mb-4" onClick={onBack}>
        ← Back to campaigns
      </button>

      <div className="panel p-6" style={{ borderTop: `4px solid ${color}` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Simulation summary · {campaign.name}</div>
            <h1 className="text-2xl font-bold mt-1" style={{ color }}>
              {outcome?.label ?? "End state"}
            </h1>
            <p className="text-ink/70 mt-1 max-w-xl">{outcome?.description}</p>
          </div>
          <span
            className="chip text-xs"
            style={{ backgroundColor: `${color}1a`, color }}
          >
            {isMeaningfulOutcome(session.selectedOutcomeId!)
              ? "Counts toward meaningful engagement"
              : tone === "closed"
                ? "Closed respectfully"
                : "Nurture / awareness"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Stat label="Actions completed" value={session.steps.length} />
          <Stat label="Campaign days" value={session.currentDay} />
          <Stat label="Direct touches" value={`${directTouches} / ${limit}`} warn={session.pressureWarning} />
          <Stat label="Personas involved" value={1 + personaChanges.length} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Card title="Route taken">
          <ol className="space-y-1.5">
            {session.steps.map((s, i) => {
              const stage = getStage(campaign, s.stageId);
              const r = stage.availableResponses.find((x) => x.id === s.responseId);
              return (
                <li key={i} className="text-[13px] flex items-start gap-2">
                  <span className="text-ink/30 mt-0.5">{i + 1}.</span>
                  <div>
                    <span className="font-medium">{stage.label}</span> <ChannelBadge channel={stage.channel} small />
                    <div className="text-ink/55 text-[12px]">→ {r?.label}</div>
                  </div>
                </li>
              );
            })}
            <li className="text-[13px] flex items-center gap-2 pt-1">
              <span className="text-ink/30">★</span>
              <span className="font-semibold" style={{ color }}>
                {outcome?.label}
              </span>
            </li>
          </ol>
        </Card>

        <Card title="What the route tells us">
          <div className="space-y-3 text-[13px]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Lesson</div>
              <p className="text-ink/75">{outcome?.lesson}</p>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Where engagement was created</div>
              <p className="text-ink/75">{engagementPoints.length ? engagementPoints.join(", ") : "No meaningful engagement was recorded on this route."}</p>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Where momentum was lost</div>
              <p className="text-ink/75">{momentumLoss.length ? momentumLoss.join(", ") : "No clear loss of momentum."}</p>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Contact pressure</div>
              <p className={session.pressureWarning ? "text-negative" : "text-positive"}>
                {session.pressureWarning
                  ? `Reached or exceeded the limit (${directTouches}/${limit}).`
                  : `Stayed within the limit (${directTouches}/${limit}).`}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Channels used">
          <div className="flex flex-wrap gap-1.5">
            {channelsUsed.map((c) => (
              <ChannelBadge key={c} channel={c} />
            ))}
          </div>
        </Card>

        <Card title="Parallel activity, waits & handoffs">
          <div className="space-y-2 text-[13px]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Parallel activities</span>
              <p className="text-ink/70">{parallels.slice(0, 8).join(", ") || "—"}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Wait periods</span>
                <p className="text-ink/70">{waits.length}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Persona handoffs</span>
                <p className="text-ink/70">{personaChanges.length}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        <button className="btn-primary" onClick={onRestart}>
          Restart same campaign
        </button>
        <button className="btn-ghost" onClick={onDifferentResponse}>
          Try a different response
        </button>
        <button className="btn-ghost" onClick={onCompare}>
          Compare with another campaign
        </button>
        <button className="btn-ghost" onClick={onExport}>
          Export session JSON
        </button>
        <button className="btn-ghost" onClick={() => window.print()}>
          Print summary
        </button>
        <button className="btn-ghost" onClick={onBack}>
          Return to campaign selector
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="rounded-lg border border-black/5 p-3">
      <div className={`text-xl font-bold ${warn ? "text-negative" : ""}`}>{value}</div>
      <div className="text-[11px] text-ink/50">{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
