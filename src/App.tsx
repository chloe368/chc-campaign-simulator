import { useCallback, useState } from "react";
import type { CampaignId } from "./domain/types";
import { getCampaign } from "./data/campaigns";
import { SAMPLE_ACCOUNT } from "./data/sample-account";
import { useSimulation } from "./hooks/use-simulation";
import { CampaignSelector } from "./components/CampaignSelector";
import { CampaignComparison } from "./components/CampaignComparison";
import { GoalPage } from "./components/GoalPage";
import { Workspace } from "./components/Workspace";
import { OutcomeSummary } from "./components/OutcomeSummary";
import { downloadSession } from "./utils/export-session";

type Screen = "selector" | "workspace" | "compare" | "summary" | "goal";

export default function App() {
  const sim = useSimulation();
  const [screen, setScreen] = useState<Screen>("selector");
  const [importError, setImportError] = useState<string | null>(null);

  const openCampaign = useCallback(
    (id: CampaignId) => {
      sim.start(id, SAMPLE_ACCOUNT);
      setScreen("workspace");
    },
    [sim],
  );

  const handleExport = useCallback(() => {
    if (sim.session) downloadSession(sim.session);
  }, [sim.session]);

  const goSummary = useCallback(() => setScreen("summary"), []);

  // Auto-advance to summary when the active session completes while in workspace.
  if (screen === "workspace" && sim.session?.status === "completed") {
    // Defer: show workspace with a completed banner but let user open summary.
  }

  const campaign = sim.session ? getCampaign(sim.session.campaignId) : null;

  if (screen === "compare") {
    return <CampaignComparison onOpen={openCampaign} onBack={() => setScreen("selector")} />;
  }

  if (screen === "goal") {
    return <GoalPage onBack={() => setScreen("selector")} />;
  }

  if (screen === "summary" && sim.session && campaign) {
    return (
      <OutcomeSummary
        campaign={campaign}
        session={sim.session}
        onRestart={() => {
          sim.reset();
          setScreen("workspace");
        }}
        onDifferentResponse={() => {
          // rewind to the last decision so a different branch can be explored
          sim.rewindToStep(Math.max(0, sim.session!.steps.length - 1));
          setScreen("workspace");
        }}
        onCompare={() => setScreen("compare")}
        onExport={handleExport}
        onBack={() => setScreen("selector")}
      />
    );
  }

  if (screen === "workspace" && sim.session && campaign) {
    return (
      <div>
        <Workspace
          campaign={campaign}
          session={sim.session}
          onSelectResponse={sim.selectResponse}
          onRewindToStep={sim.rewindToStep}
          onReset={sim.reset}
          onExport={handleExport}
          onBack={() => setScreen("selector")}
        />
        {sim.session.status === "completed" && (
          <div className="fixed bottom-6 right-6 z-30">
            <button className="btn-primary shadow-lift" onClick={goSummary}>
              View simulation summary →
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {importError && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div className="rounded-lg bg-negative/10 border border-negative/30 text-negative px-4 py-2 text-sm flex items-center justify-between">
            <span>Import failed: {importError}</span>
            <button onClick={() => setImportError(null)} aria-label="Dismiss">
              ✕
            </button>
          </div>
        </div>
      )}
      <CampaignSelector
        onOpen={openCampaign}
        onCompare={() => setScreen("compare")}
        onResume={() => setScreen("workspace")}
        onViewGoal={() => setScreen("goal")}
        onImport={(s) => {
          sim.importSession(s);
          setImportError(null);
          setScreen("workspace");
        }}
        onImportError={setImportError}
        savedSession={sim.session}
      />
    </div>
  );
}
