import { useEffect } from "react";
import type { CampaignDefinition, ResponseOption, SimulationSession } from "../domain/types";
import { getStage } from "../data/campaigns";
import { ChannelBadge, StrengthBadge } from "./ui";
import { CHANNEL_META } from "./channel-meta";

function nextMoveHints(r: ResponseOption) {
  const hints: { label: string; className: string }[] = [];
  if (r.pausesCampaign || r.effects.some((e) => e.type === "pause-scheduled-outreach"))
    hints.push({ label: "Pauses the campaign", className: "bg-positive/10 text-positive" });
  const chEffect = r.effects.find((e) => e.type === "change-channel");
  if (chEffect && chEffect.type === "change-channel")
    hints.push({ label: `Channel → ${CHANNEL_META[chEffect.channel].label}`, className: "bg-linkedin/10 text-linkedin" });
  if (r.changesPersona || r.effects.some((e) => e.type === "change-persona"))
    hints.push({ label: "Persona handoff", className: "bg-persona/10 text-persona" });
  if (r.nextAction.waitDays) hints.push({ label: `Wait ${r.nextAction.waitDays} day${r.nextAction.waitDays === 1 ? "" : "s"}`, className: "bg-timing/10 text-timing" });
  if (r.nextAction.outcomeId) hints.push({ label: "Reaches an end state", className: "bg-outcome/10 text-outcome" });
  return hints;
}

interface Props {
  campaign: CampaignDefinition;
  session: SimulationSession;
  open: boolean;
  onClose: () => void;
  onSelect: (stageId: string, responseId: string) => void;
}

export function ResponseChooser({ campaign, session, open, onClose, onSelect }: Props) {
  const stage = session.pendingStageId ? getStage(campaign, session.pendingStageId) : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !stage) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Choose what happened">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-lift max-h-[88vh] overflow-y-auto">
        {/* Header: what action was completed + channel */}
        <div className="sticky top-0 bg-white border-b border-black/5 px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Action completed · {stage.dayLabel}</div>
            <div className="text-lg font-semibold mt-0.5">{stage.label}</div>
            <div className="flex items-center gap-2 mt-1">
              <ChannelBadge channel={stage.channel} />
              <span className="text-xs text-ink/55">{stage.directAction}</span>
            </div>
          </div>
          <button className="btn-ghost !p-2" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="text-sm font-medium text-ink/70 mb-3">What happened? Choose the prospect's response:</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {stage.availableResponses.map((r) => {
              const hints = nextMoveHints(r);
              return (
                <button
                  key={r.id}
                  onClick={() => onSelect(stage.id, r.id)}
                  className="text-left panel p-4 hover:shadow-lift hover:border-email/40 transition focus-visible:ring-2 focus-visible:ring-email"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{r.label}</span>
                    <StrengthBadge strength={r.strength} />
                  </div>
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Meaning</span>
                    <p className="text-[13px] text-ink/75 leading-snug">{r.description}</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Next move</span>
                    <p className="text-[13px] text-ink/85 font-medium leading-snug">{r.nextAction.label}</p>
                  </div>
                  <div className="mt-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Why</span>
                    <p className="text-[12px] text-ink/60 leading-snug">{r.nextAction.explanation}</p>
                  </div>
                  {hints.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-black/5">
                      {hints.map((h, i) => (
                        <span key={i} className={`chip text-[10px] ${h.className}`}>
                          {h.label}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
