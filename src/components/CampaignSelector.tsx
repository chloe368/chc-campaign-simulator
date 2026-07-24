import { useRef } from "react";
import type { CampaignDefinition, CampaignId, SimulationSession } from "../domain/types";
import { CAMPAIGNS } from "../data/campaigns";

// Distinct accent per campaign so each is recognizable at a glance.
const ACCENT: Record<CampaignId, string> = {
  "email-led": "#2563eb",
  "social-awareness": "#4f46e5",
  "physical-mail-led": "#b8860b",
};

function CampaignCard({ c, onOpen }: { c: CampaignDefinition; onOpen: (id: CampaignId) => void }) {
  const accent = ACCENT[c.id];
  return (
    <div className="panel overflow-hidden flex flex-col hover:shadow-lift transition-shadow">
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold" style={{ color: accent }}>
            {c.name}
          </h3>
          <span className="chip bg-ink/[0.06] text-ink/60 shrink-0">{c.period}</span>
        </div>
        <div className="text-xs font-medium mt-1" style={{ color: accent }}>
          {c.primaryStrength}
        </div>
        <p className="text-sm text-ink/70 mt-2 leading-relaxed flex-1">{c.description}</p>
        <button
          className="mt-5 w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ backgroundColor: accent }}
          onClick={() => onOpen(c.id)}
        >
          Open →
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
    <div className="min-h-screen grid place-items-center px-6 py-12">
      <div className="w-full max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Choose a campaign to simulate</h1>
          <p className="text-ink/60 mt-2">Pick one to move through it, action by action.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CAMPAIGNS.map((c) => (
            <CampaignCard key={c.id} c={c} onOpen={onOpen} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          <button
            className="rounded-lg px-4 py-2 text-sm font-semibold bg-outcome text-white hover:brightness-110 transition inline-flex items-center gap-2"
            onClick={onViewGoal}
          >
            <span aria-hidden>🎯</span> The 80% goal
          </button>
          <button className="btn-ghost !py-2" onClick={onCompare}>
            Compare campaigns
          </button>
          {savedSession && (
            <button className="btn-ghost !py-2" onClick={onResume}>
              Resume saved
            </button>
          )}
          <button className="btn-ghost !py-2" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
        </div>
      </div>
    </div>
  );
}
