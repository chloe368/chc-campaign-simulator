import type { CampaignDefinition, SimulationSession } from "../domain/types";
import { getStage } from "../data/campaigns";
import { ChannelBadge } from "./ui";

interface Props {
  campaign: CampaignDefinition;
  session: SimulationSession;
  onRewind: (stepIndex: number) => void;
}

export function StageTimeline({ campaign, session, onRewind }: Props) {
  const pending = session.pendingStageId ? getStage(campaign, session.pendingStageId) : null;

  return (
    <div className="panel p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Campaign journey</h2>
        <span className="chip bg-ink/[0.05] text-ink/60">{campaign.period}</span>
      </div>

      {/* Route already taken */}
      <ol className="space-y-2">
        {session.steps.map((step, i) => {
          const stage = getStage(campaign, step.stageId);
          const response = stage.availableResponses.find((r) => r.id === step.responseId);
          return (
            <li key={`${step.stageId}-${i}`}>
              <button
                onClick={() => onRewind(i)}
                className="w-full text-left rounded-lg border border-black/5 bg-white p-2.5 hover:border-email/40 hover:bg-email/[0.03] transition group"
                title="Rewind to this step and choose a different response"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-positive/15 text-positive text-[11px] font-bold grid place-items-center">
                      ✓
                    </span>
                    <span className="text-sm font-medium truncate">{stage.label}</span>
                  </div>
                  <span className="text-[10px] text-ink/40 group-hover:text-email">rewind</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 pl-7">
                  <ChannelBadge channel={stage.channel} small />
                  <span className="text-[10px] text-ink/45">{stage.dayLabel}</span>
                </div>
                {response && (
                  <div className="text-[11px] text-ink/60 mt-1 pl-7">→ {response.label}</div>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Current stage */}
      {pending && session.status !== "completed" && (
        <div className="mt-3">
          <div className="rounded-lg border-2 border-email/50 bg-email/[0.04] p-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-email text-white text-[11px] font-bold grid place-items-center animate-pulse">
                ●
              </span>
              <span className="text-sm font-semibold">{pending.label}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 pl-7">
              <ChannelBadge channel={pending.channel} small />
              <span className="text-[10px] text-ink/45">{pending.dayLabel} · current</span>
            </div>
            <p className="text-[11px] text-ink/60 mt-1.5 pl-7">{pending.objective}</p>
          </div>

          {/* Parallel activities beside the current stage */}
          {pending.parallelActions.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40 mb-1.5">
                Parallel activities
              </div>
              <div className="space-y-1.5">
                {pending.parallelActions.map((pa) => (
                  <div
                    key={pa.id}
                    className="rounded-md border border-dashed border-ink/20 bg-ink/[0.02] p-2 flex items-start gap-2"
                  >
                    <ChannelBadge channel={pa.channel} small />
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium">{pa.label}</div>
                      <div className="text-[10px] text-ink/55">{pa.purpose}</div>
                      <div className="text-[10px] mt-0.5">
                        <span
                          className="chip text-[9px]"
                          style={
                            pa.signalType === "engagement"
                              ? { backgroundColor: "#0d94881a", color: "#0d9488" }
                              : { backgroundColor: "#64748b1a", color: "#64748b" }
                          }
                        >
                          {pa.signalType === "engagement" ? "can create a signal" : "awareness only"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Possible next stages (future) */}
      {pending && session.status !== "completed" && (
        <div className="mt-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40 mb-1.5">Possible next moves</div>
          <div className="space-y-1">
            {(() => {
              const moves = new Map<string, string>();
              for (const r of pending.availableResponses) {
                if (r.nextAction.outcomeId) moves.set(`o:${r.nextAction.outcomeId}`, `End: ${r.nextAction.outcomeId.replace(/-/g, " ")}`);
                else if (r.nextAction.nextStageId)
                  moves.set(`s:${r.nextAction.nextStageId}`, getStage(campaign, r.nextAction.nextStageId).label);
              }
              return Array.from(moves.entries()).map(([k, label]) => (
                <div key={k} className="text-[11px] text-ink/60 flex items-center gap-1.5">
                  <span className="text-ink/30">↳</span>
                  {label}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {session.status === "completed" && (
        <div className="mt-3 rounded-lg border-2 border-outcome/50 bg-outcome/[0.05] p-2.5 text-sm">
          <span className="font-semibold text-outcome">Reached an end state.</span>
          <span className="text-ink/60"> See the summary for the full route.</span>
        </div>
      )}
    </div>
  );
}
