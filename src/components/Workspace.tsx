import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CampaignDefinition, SimulationSession } from "../domain/types";
import { StageTimeline } from "./StageTimeline";
import { WorkflowCanvas } from "./WorkflowCanvas";
import { ResponseChooser } from "./ResponseChooser";
import { SimulationControls, type SimMode } from "./SimulationControls";
import { DEFAULT_DEMO_WEIGHTS, makeRng, pickDemoResponse, type DemoWeights } from "../domain/demo-mode";
import { validateCampaign } from "../domain/campaign-validator";

interface Props {
  campaign: CampaignDefinition;
  session: SimulationSession;
  onSelectResponse: (stageId: string, responseId: string) => void;
  onRewindToStep: (stepIndex: number) => void;
  onReset: () => void;
  onExport: () => void;
  onBack: () => void;
}

export function Workspace({ campaign, session, onSelectResponse, onRewindToStep, onReset, onExport, onBack }: Props) {
  const [mode, setMode] = useState<SimMode>("manual");
  const [showAll, setShowAll] = useState(false);
  const [chooserOpen, setChooserOpen] = useState(false);

  // Auto-demo state
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [seed, setSeed] = useState(1234);
  const [weights, setWeights] = useState<DemoWeights>(DEFAULT_DEMO_WEIGHTS);
  const [lastPick, setLastPick] = useState<string | null>(null);

  const isCompleted = session.status === "completed";
  const canRewind = session.steps.length > 0;

  // Auto-open the chooser in manual mode when a stage becomes pending.
  useEffect(() => {
    if (mode === "manual" && !isCompleted && session.pendingStageId) {
      // do not auto-pop on every render; only when there is no chooser open already handled by user
    }
  }, [mode, isCompleted, session.pendingStageId]);

  const handleSelect = useCallback(
    (stageId: string, responseId: string) => {
      const stage = campaign.stages.find((s) => s.id === stageId);
      const r = stage?.availableResponses.find((x) => x.id === responseId);
      setLastPick(r ? r.label : null);
      onSelectResponse(stageId, responseId);
      setChooserOpen(false);
    },
    [campaign, onSelectResponse],
  );

  // ---- Auto-demo runner ------------------------------------------------------
  const timerRef = useRef<number | null>(null);
  const stepDemo = useCallback(() => {
    if (session.status === "completed" || !session.pendingStageId) {
      setDemoPlaying(false);
      return;
    }
    const rng = makeRng(seed + session.steps.length * 7919);
    const responseId = pickDemoResponse(campaign, session, weights, rng);
    if (!responseId) {
      setDemoPlaying(false);
      return;
    }
    handleSelect(session.pendingStageId, responseId);
  }, [campaign, session, seed, weights, handleSelect]);

  useEffect(() => {
    if (mode !== "demo" || !demoPlaying) return;
    if (isCompleted) {
      setDemoPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(stepDemo, 1100);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [mode, demoPlaying, isCompleted, stepDemo]);

  useEffect(() => {
    if (mode !== "demo") setDemoPlaying(false);
  }, [mode]);

  const validationIssues = useMemo(
    () => (import.meta.env.DEV ? validateCampaign(campaign).filter((i) => i.level === "error") : []),
    [campaign],
  );

  return (
    <div className="h-screen flex flex-col">
      <div className="px-4 pt-3">
        <SimulationControls
          campaignName={campaign.name}
          mode={mode}
          setMode={setMode}
          onAdvance={() => setChooserOpen(true)}
          onRewindLast={() => onRewindToStep(session.steps.length - 1)}
          onReset={onReset}
          onExport={onExport}
          showAll={showAll}
          setShowAll={setShowAll}
          canRewind={canRewind}
          isCompleted={isCompleted}
          onBack={onBack}
          demoPlaying={demoPlaying}
          onDemoPlay={() => setDemoPlaying(true)}
          onDemoPause={() => setDemoPlaying(false)}
          onDemoStep={stepDemo}
          seed={seed}
          setSeed={setSeed}
          weights={weights}
          setWeights={setWeights}
        />
      </div>

      {validationIssues.length > 0 && (
        <div className="mx-4 mt-2 rounded-lg bg-negative/10 border border-negative/30 text-negative px-4 py-2 text-xs">
          <strong>Workflow validator:</strong> {validationIssues.length} definition error(s) in this campaign —{" "}
          {validationIssues[0].message}
        </div>
      )}

      {mode === "demo" && lastPick && !isCompleted && (
        <div className="mx-4 mt-2 rounded-lg bg-email/10 border border-email/20 text-email px-4 py-1.5 text-xs">
          Demo chose: <strong>{lastPick}</strong>
        </div>
      )}

      {/* Two-panel layout: journey timeline + workflow canvas */}
      <div className="flex-1 grid grid-cols-12 gap-3 p-4 min-h-0">
        <div className="col-span-3 min-h-0">
          <StageTimeline campaign={campaign} session={session} onRewind={onRewindToStep} />
        </div>

        <div className="col-span-9 min-h-0 flex flex-col gap-3">
          <div className="panel flex-1 min-h-0 overflow-hidden relative">
            <WorkflowCanvas campaign={campaign} session={session} showAll={showAll} onSelect={handleSelect} />
            {!isCompleted && (
              <button
                className="btn-primary absolute bottom-4 left-1/2 -translate-x-1/2 shadow-lift"
                onClick={() => setChooserOpen(true)}
              >
                What happened? Record response →
              </button>
            )}
          </div>
        </div>
      </div>

      <ResponseChooser
        campaign={campaign}
        session={session}
        open={chooserOpen && !isCompleted}
        onClose={() => setChooserOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}
