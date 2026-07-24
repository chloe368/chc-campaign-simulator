import { CHANNEL_META, STRENGTH_META } from "./channel-meta";
import type { Channel, ResponseStrength } from "../domain/types";

const NODE_SHAPES: { label: string; hint: string; className: string }[] = [
  { label: "Action", hint: "Rounded rectangle", className: "rounded-md" },
  { label: "Response check", hint: "Diamond", className: "rotate-45 rounded-sm" },
  { label: "Parallel action", hint: "Dashed border", className: "rounded-md border-dashed" },
  { label: "Wait", hint: "Pause", className: "rounded-full" },
  { label: "End state", hint: "Stadium", className: "rounded-full px-3" },
];

export function Legend() {
  return (
    <div className="panel p-4 space-y-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/45 mb-2">Channels</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CHANNEL_META) as Channel[]).map((c) => (
            <span key={c} className="chip text-[10px]" style={{ backgroundColor: `${CHANNEL_META[c].color}1a`, color: CHANNEL_META[c].color }}>
              <span aria-hidden className="font-bold">{CHANNEL_META[c].icon}</span>
              {CHANNEL_META[c].label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/45 mb-2">Response strength</div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(STRENGTH_META) as ResponseStrength[]).map((s) => (
            <span key={s} className="chip text-[10px]" style={{ backgroundColor: `${STRENGTH_META[s].color}1a`, color: STRENGTH_META[s].color }}>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: 9999, backgroundColor: STRENGTH_META[s].color }} />
              {STRENGTH_META[s].label}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/45 mb-2">Node shapes</div>
        <div className="flex flex-wrap gap-2">
          {NODE_SHAPES.map((n) => (
            <div key={n.label} className="flex items-center gap-1.5 text-[11px] text-ink/70">
              <span className={`inline-block w-5 h-4 border border-ink/40 ${n.className}`} aria-hidden />
              {n.label}
            </div>
          ))}
        </div>
      </div>
      <div className="text-[11px] text-ink/50 leading-relaxed border-t border-black/5 pt-3">
        Solid = main route · Dotted = response branch · Dashed = parallel action. Passive signals move only timing,
        channel or context — never counted as a positive reply.
      </div>
    </div>
  );
}
