import type { Channel, ResponseStrength } from "../domain/types";
import { CHANNEL_META, STRENGTH_META } from "./channel-meta";

export function ChannelBadge({ channel, small }: { channel: Channel; small?: boolean }) {
  const m = CHANNEL_META[channel];
  return (
    <span
      className={`chip ${small ? "text-[10px]" : "text-xs"}`}
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
      title={m.label}
    >
      <span aria-hidden className="font-bold tracking-tight">
        {m.icon}
      </span>
      <span>{m.label}</span>
    </span>
  );
}

export function StrengthBadge({ strength }: { strength: ResponseStrength }) {
  const m = STRENGTH_META[strength];
  return (
    <span className="chip" style={{ backgroundColor: `${m.color}1a`, color: m.color }} title={m.note}>
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

export function Dot({ color }: { color: string }) {
  return <span aria-hidden style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: color, display: "inline-block" }} />;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">{children}</div>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-ink/40">{label}</span>
      <span className="text-sm text-ink">{children}</span>
    </div>
  );
}
