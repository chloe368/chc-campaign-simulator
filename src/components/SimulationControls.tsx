import { useState } from "react";
import type { ResponseStrength } from "../domain/types";
import type { DemoWeights } from "../domain/demo-mode";
import { STRENGTH_META } from "./channel-meta";

export type SimMode = "manual" | "demo";

interface Props {
  campaignName: string;
  mode: SimMode;
  setMode: (m: SimMode) => void;
  onAdvance: () => void;
  onRewindLast: () => void;
  onReset: () => void;
  onExport: () => void;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  canRewind: boolean;
  isCompleted: boolean;
  onBack: () => void;
  // demo
  demoPlaying: boolean;
  onDemoPlay: () => void;
  onDemoPause: () => void;
  onDemoStep: () => void;
  seed: number;
  setSeed: (n: number) => void;
  weights: DemoWeights;
  setWeights: (w: DemoWeights) => void;
}

export function SimulationControls(p: Props) {
  const [showWeights, setShowWeights] = useState(false);

  return (
    <div className="panel px-4 py-2.5 flex items-center gap-3 flex-wrap">
      <button className="text-sm text-ink/50 hover:text-ink" onClick={p.onBack}>
        ← Campaigns
      </button>
      <div className="font-semibold text-sm">{p.campaignName}</div>

      {/* Mode segmented control */}
      <div className="flex rounded-lg border border-black/10 overflow-hidden text-xs" role="tablist" aria-label="Simulation mode">
        {(["manual", "demo"] as SimMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={p.mode === m}
            onClick={() => p.setMode(m)}
            className={`px-3 py-1.5 capitalize ${p.mode === m ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-black/[0.03]"}`}
          >
            {m === "demo" ? "Auto-demo" : m}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-black/10" />

      {/* Core actions */}
      {!p.isCompleted && (
        <button className="btn-primary !py-1.5 text-xs" onClick={p.onAdvance}>
          Record response
        </button>
      )}
      <button className="btn-ghost !py-1.5 text-xs" onClick={p.onRewindLast} disabled={!p.canRewind}>
        Rewind
      </button>
      <button className="btn-ghost !py-1.5 text-xs" onClick={p.onReset} disabled={!p.canRewind}>
        Reset
      </button>
      <label className="flex items-center gap-1.5 text-xs text-ink/70 cursor-pointer">
        <input type="checkbox" checked={p.showAll} onChange={(e) => p.setShowAll(e.target.checked)} />
        Show all branches
      </label>
      <button className="btn-ghost !py-1.5 text-xs" onClick={p.onExport}>
        Export JSON
      </button>

      {/* Auto-demo controls */}
      {p.mode === "demo" && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="chip text-[10px] bg-timing/10 text-timing">Weights are demo assumptions, not conversion rates</span>
          {p.demoPlaying ? (
            <button className="btn-ghost !py-1.5 text-xs" onClick={p.onDemoPause}>
              ⏸ Pause
            </button>
          ) : (
            <button className="btn-ghost !py-1.5 text-xs" onClick={p.onDemoPlay} disabled={p.isCompleted}>
              ▶ Play
            </button>
          )}
          <button className="btn-ghost !py-1.5 text-xs" onClick={p.onDemoStep} disabled={p.isCompleted}>
            Step
          </button>
          <label className="text-xs text-ink/60 flex items-center gap-1">
            seed
            <input
              type="number"
              value={p.seed}
              onChange={(e) => p.setSeed(Number(e.target.value) || 0)}
              className="w-16 rounded border border-black/10 px-1.5 py-1 text-xs"
            />
          </label>
          <button className="btn-ghost !py-1.5 text-xs" onClick={() => setShowWeights((v) => !v)}>
            Weights
          </button>
        </div>
      )}

      {p.mode === "demo" && showWeights && (
        <div className="w-full mt-2 border-t border-black/5 pt-3">
          <div className="text-[11px] text-ink/50 mb-2">
            Demonstration assumptions — relative likelihood of each response strength. Edit freely.
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(p.weights) as ResponseStrength[]).map((s) => (
              <label key={s} className="flex items-center justify-between gap-2 text-xs rounded border border-black/10 px-2 py-1.5">
                <span style={{ color: STRENGTH_META[s].color }}>{STRENGTH_META[s].label}</span>
                <input
                  type="number"
                  min={0}
                  value={p.weights[s]}
                  onChange={(e) => p.setWeights({ ...p.weights, [s]: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-14 rounded border border-black/10 px-1.5 py-1 text-xs"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
