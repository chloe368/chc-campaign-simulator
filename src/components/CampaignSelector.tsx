import { useRef } from "react";
import type { CampaignDefinition, CampaignId, SimulationSession } from "../domain/types";
import { CAMPAIGNS } from "../data/campaigns";
import { ChannelBadge } from "./ui";
import { Legend } from "./Legend";

// Distinct accent per campaign so each is recognizable at a glance.
const ACCENT: Record<CampaignId, { color: string; soft: string; label: string }> = {
  "email-led": { color: "#2563eb", soft: "#2563eb14", label: "Blue" },
  "social-awareness": { color: "#4f46e5", soft: "#4f46e514", label: "Indigo" },
  "physical-mail-led": { color: "#b8860b", soft: "#b8860b14", label: "Gold" },
};

function MiniPreview() {
  const steps = [
    { label: "Action", tone: "#2563eb" },
    { label: "Response", tone: "#64748b" },
    { label: "Next move", tone: "#8b5cf6" },
    { label: "Outcome", tone: "#0d9488" },
  ];
  return (
    <div className="flex items-center gap-1.5 mt-2" aria-hidden>
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${s.tone}1a`, color: s.tone }}>
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="text-ink/30 text-xs">→</span>}
        </div>
      ))}
    </div>
  );
}

function CampaignCard({ c, onOpen }: { c: CampaignDefinition; onOpen: (id: CampaignId) => void }) {
  const accent = ACCENT[c.id];
  return (
    <div className="panel overflow-hidden flex flex-col hover:shadow-lift transition-shadow group">
      {/* Colored accent bar identifies the campaign */}
      <div className="h-1.5 w-full" style={{ backgroundColor: accent.color }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold" style={{ color: accent.color }}>
            {c.name}
          </h3>
          <span className="chip bg-ink/[0.06] text-ink/60 shrink-0">{c.period}</span>
        </div>
        <p className="text-sm text-ink/70 mt-2 leading-relaxed">{c.description}</p>

        <div className="mt-4 space-y-3 flex-1">
          <div className="rounded-lg p-3" style={{ backgroundColor: accent.soft, border: `1px solid ${accent.color}22` }}>
            <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent.color }}>
              What makes it strong · {c.primaryStrength}
            </div>
            <p className="text-[12px] text-ink/75 leading-snug mt-1">{c.uniqueStrength}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40 mb-1">Why it works</div>
            <ul className="space-y-1">
              {c.whyItWorks.map((w) => (
                <li key={w} className="text-[12px] text-ink/75 leading-snug flex gap-1.5">
                  <span style={{ color: accent.color }} className="mt-px shrink-0">
                    ✓
                  </span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Best suited for</div>
            <div className="text-sm text-ink/80">{c.bestFor}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40 mb-1">Main channels</div>
            <div className="flex flex-wrap gap-1">
              {c.mainChannels.map((ch) => (
                <ChannelBadge key={ch} channel={ch} small />
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Journey preview</div>
            <MiniPreview />
          </div>
        </div>

        <button
          className="mt-5 w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ backgroundColor: accent.color }}
          onClick={() => onOpen(c.id)}
        >
          Open {c.name} →
        </button>
      </div>
    </div>
  );
}

interface Props {
  onOpen: (id: CampaignId) => void;
  onCompare: () => void;
  onResume: () => void;
  onViewGoal: () => void;
  onImport: (session: SimulationSession) => void;
  savedSession: SimulationSession | null;
  onImportError: (msg: string) => void;
}

export function CampaignSelector({ onOpen, onCompare, onResume, onViewGoal, onImport, savedSession, onImportError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then(async (text) => {
        const { importSession } = await import("../utils/import-session");
        try {
          onImport(importSession(text));
        } catch (err) {
          onImportError((err as Error).message);
        }
      })
      .finally(() => {
        if (fileRef.current) fileRef.current.value = "";
      });
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="bg-gradient-to-br from-ink to-ink/90 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <span className="chip bg-white/10 text-white/80">Campaign operations · workshop map</span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3">Choose a campaign to simulate</h1>
          <p className="text-white/70 mt-2 max-w-2xl text-lg leading-relaxed">
            Three outreach playbooks, turned into an interactive, branch-based journey. Move one action at a time, choose
            what the prospect does, and follow the right next move to a deliberate end state.
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              className="rounded-lg px-4 py-2.5 text-sm font-semibold bg-outcome text-white hover:brightness-110 transition inline-flex items-center gap-2"
              onClick={onViewGoal}
            >
              <span aria-hidden>🎯</span> View the 80% goal
            </button>
            <button className="rounded-lg px-4 py-2.5 text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition" onClick={onCompare}>
              Compare campaigns
            </button>
            {savedSession && (
              <button className="rounded-lg px-4 py-2.5 text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition" onClick={onResume}>
                Resume saved simulation
              </button>
            )}
            <button
              className="rounded-lg px-4 py-2.5 text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition"
              onClick={() => fileRef.current?.click()}
            >
              Import session JSON
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">Pick a campaign</h2>
          <span className="chip bg-ink/[0.05] text-ink/60">Sample account: Harbor Community Health Center</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {CAMPAIGNS.map((c) => (
            <CampaignCard key={c.id} c={c} onOpen={onOpen} />
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50 mb-3">How to read the map</h2>
          <Legend />
        </div>
      </div>
    </div>
  );
}
