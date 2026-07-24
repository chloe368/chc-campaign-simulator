import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import type { CampaignDefinition, Channel, OutcomeType, SimulationSession } from "../domain/types";
import { getStage } from "../data/campaigns";
import { CHANNEL_META, STRENGTH_META, OUTCOME_COLOR } from "./channel-meta";

// -------------------------------- custom nodes --------------------------------
function ActionNode({ data }: NodeProps) {
  const d = data as any;
  const ch = d.channel as Channel;
  const color = CHANNEL_META[ch]?.color ?? "#8a8a82";
  return (
    <div
      className={`rounded-xl bg-white shadow-card px-3 py-2 w-52 ${d.active ? "ring-2" : "border border-black/10"}`}
      style={d.active ? ({ boxShadow: `0 0 0 2px ${color}` } as any) : undefined}
    >
      <Handle type="target" position={Position.Left} className="!bg-ink/30" />
      <div className="flex items-center justify-between">
        <span className="chip text-[10px]" style={{ backgroundColor: `${color}1a`, color }}>
          {CHANNEL_META[ch]?.icon} {CHANNEL_META[ch]?.label}
        </span>
        <span className="text-[10px] text-ink/40">{d.dayLabel}</span>
      </div>
      <div className="text-sm font-semibold mt-1">{d.label}</div>
      <div className="text-[11px] text-ink/55 mt-0.5 leading-snug line-clamp-2">{d.action}</div>
      <Handle type="source" position={Position.Right} className="!bg-ink/30" />
    </div>
  );
}

function TrailNode({ data }: NodeProps) {
  const d = data as any;
  const ch = d.channel as Channel;
  const color = CHANNEL_META[ch]?.color ?? "#8a8a82";
  return (
    <div className="rounded-lg bg-white border border-black/10 px-2.5 py-1.5 w-44 opacity-90">
      <Handle type="target" position={Position.Left} className="!bg-ink/20" />
      <div className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded-full bg-positive/15 text-positive text-[10px] font-bold grid place-items-center">✓</span>
        <span className="text-[12px] font-medium truncate">{d.label}</span>
      </div>
      <div className="text-[10px] mt-0.5" style={{ color }}>
        {CHANNEL_META[ch]?.label} · {d.response}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-ink/20" />
    </div>
  );
}

function DecisionNode({ data }: NodeProps) {
  const d = data as any;
  return (
    <div className="grid place-items-center" style={{ width: 96, height: 96 }}>
      <Handle type="target" position={Position.Left} className="!bg-ink/30" />
      <div className="bg-white border border-ink/25 shadow-card grid place-items-center" style={{ width: 68, height: 68, transform: "rotate(45deg)" }}>
        <span className="text-[11px] font-semibold text-center leading-tight" style={{ transform: "rotate(-45deg)" }}>
          {d.label}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-ink/30" />
    </div>
  );
}

function ResponseNode({ data }: NodeProps) {
  const d = data as any;
  const sm = STRENGTH_META[d.strength as keyof typeof STRENGTH_META];
  return (
    <button
      onClick={d.onSelect}
      className="text-left rounded-lg bg-white border border-black/10 hover:border-ink/40 hover:shadow-lift transition px-3 py-2 w-56 focus-visible:ring-2 focus-visible:ring-email"
      style={{ borderLeft: `4px solid ${sm.color}` }}
    >
      <Handle type="target" position={Position.Left} className="!bg-ink/30" />
      <div className="flex items-center justify-between gap-1">
        <span className="text-[12px] font-semibold">{d.label}</span>
        <span className="chip text-[9px]" style={{ backgroundColor: `${sm.color}1a`, color: sm.color }}>
          {sm.label}
        </span>
      </div>
      <div className="text-[10px] text-ink/55 mt-0.5 leading-snug line-clamp-2">{d.nextLabel}</div>
      <div className="flex flex-wrap gap-1 mt-1">
        {d.pauses && <span className="chip text-[9px] bg-positive/10 text-positive">pauses</span>}
        {d.channelChange && <span className="chip text-[9px] bg-linkedin/10 text-linkedin">channel →</span>}
        {d.personaChange && <span className="chip text-[9px] bg-persona/10 text-persona">persona →</span>}
        {d.wait ? <span className="chip text-[9px] bg-timing/10 text-timing">wait {d.wait}d</span> : null}
        {d.outcome && <span className="chip text-[9px] bg-outcome/10 text-outcome">end state</span>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-ink/30" />
    </button>
  );
}

function OutcomeNode({ data }: NodeProps) {
  const d = data as any;
  const color = OUTCOME_COLOR[d.outcomeId as OutcomeType] ?? "#0d9488";
  return (
    <div className="grid place-items-center rounded-full px-4 py-2.5 text-white shadow-card w-52" style={{ backgroundColor: color }}>
      <Handle type="target" position={Position.Left} className="!bg-white/60" />
      <div className="text-[10px] uppercase tracking-wide opacity-80">End state</div>
      <div className="text-sm font-semibold text-center leading-tight">{d.label}</div>
      <Handle type="source" position={Position.Right} className="!bg-white/60" />
    </div>
  );
}

function ParallelNode({ data }: NodeProps) {
  const d = data as any;
  const ch = d.channel as Channel;
  const color = CHANNEL_META[ch]?.color ?? "#8a8a82";
  return (
    <div className="rounded-lg border border-dashed px-2.5 py-1.5 w-48 bg-white/70" style={{ borderColor: `${color}80` }}>
      <Handle type="target" position={Position.Top} className="!bg-ink/20" />
      <div className="text-[11px] font-medium" style={{ color }}>
        {CHANNEL_META[ch]?.label}
      </div>
      <div className="text-[11px] text-ink/70 leading-snug">{d.label}</div>
      <div className="text-[9px] text-ink/45">{d.signalType === "engagement" ? "can create a signal" : "awareness only"}</div>
    </div>
  );
}

const nodeTypes = {
  action: ActionNode,
  trail: TrailNode,
  decision: DecisionNode,
  response: ResponseNode,
  outcome: OutcomeNode,
  parallel: ParallelNode,
};

interface Props {
  campaign: CampaignDefinition;
  session: SimulationSession;
  showAll: boolean;
  onSelect: (stageId: string, responseId: string) => void;
}

function buildFocusedGraph(campaign: CampaignDefinition, session: SimulationSession, onSelect: Props["onSelect"]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Trail of completed steps.
  session.steps.forEach((step, i) => {
    const stage = getStage(campaign, step.stageId);
    const response = stage.availableResponses.find((r) => r.id === step.responseId);
    const id = `trail-${i}`;
    nodes.push({
      id,
      type: "trail",
      position: { x: 20, y: 40 + i * 82 },
      data: { label: stage.label, channel: stage.channel, response: response?.label ?? "" },
    });
    if (i > 0) {
      edges.push({ id: `te-${i}`, source: `trail-${i - 1}`, target: id, animated: true, style: { stroke: "#1f2430", strokeWidth: 2 } });
    }
  });

  const trailBottom = 40 + session.steps.length * 82;
  const lastTrail = session.steps.length ? `trail-${session.steps.length - 1}` : null;

  if (session.status === "completed" && session.selectedOutcomeId) {
    const outcome = campaign.outcomes.find((o) => o.id === session.selectedOutcomeId);
    const oid = "final-outcome";
    nodes.push({
      id: oid,
      type: "outcome",
      position: { x: 320, y: Math.max(60, trailBottom / 2 - 20) },
      data: { label: outcome?.label ?? session.selectedOutcomeId, outcomeId: session.selectedOutcomeId },
    });
    if (lastTrail) edges.push({ id: "e-final", source: lastTrail, target: oid, animated: true, style: { stroke: "#0d9488", strokeWidth: 2 } });
    return { nodes, edges };
  }

  const pending = session.pendingStageId ? getStage(campaign, session.pendingStageId) : null;
  if (!pending) return { nodes, edges };

  const responses = pending.availableResponses;
  const blockHeight = responses.length * 96;
  const centerY = Math.max(trailBottom / 2, blockHeight / 2) + 20;

  // Current action.
  const curId = "current";
  nodes.push({
    id: curId,
    type: "action",
    position: { x: 300, y: centerY - 30 },
    data: { label: pending.label, channel: pending.channel, dayLabel: pending.dayLabel, action: pending.directAction, active: true },
  });
  if (lastTrail) edges.push({ id: "e-cur", source: lastTrail, target: curId, animated: true, style: { stroke: "#1f2430", strokeWidth: 2 } });

  // Decision diamond.
  const decId = "decision";
  nodes.push({ id: decId, type: "decision", position: { x: 560, y: centerY - 48 }, data: { label: "What happened?" } });
  edges.push({ id: "e-dec", source: curId, target: decId, style: { stroke: "#1f2430", strokeWidth: 2 } });

  // Response branch nodes.
  responses.forEach((r, i) => {
    const rid = `r-${r.id}`;
    const y = 20 + i * 96;
    const sm = STRENGTH_META[r.strength];
    let nextLabel = r.nextAction.label;
    nodes.push({
      id: rid,
      type: "response",
      position: { x: 760, y },
      data: {
        label: r.label,
        strength: r.strength,
        nextLabel,
        pauses: r.pausesCampaign || r.effects.some((e) => e.type === "pause-scheduled-outreach"),
        channelChange: !!r.nextAction.channel || r.effects.some((e) => e.type === "change-channel"),
        personaChange: r.changesPersona || r.effects.some((e) => e.type === "change-persona"),
        wait: r.nextAction.waitDays ?? 0,
        outcome: !!r.nextAction.outcomeId,
        onSelect: () => onSelect(pending.id, r.id),
      },
    });
    edges.push({
      id: `e-r-${r.id}`,
      source: decId,
      target: rid,
      style: { stroke: sm.color, strokeDasharray: "2 3", strokeWidth: 1.5 },
    });
  });

  // Parallel swimlane below the current action.
  pending.parallelActions.forEach((pa, i) => {
    const pid = `p-${pa.id}`;
    nodes.push({
      id: pid,
      type: "parallel",
      position: { x: 220 + i * 210, y: centerY + 120 },
      data: { label: pa.label, channel: pa.channel, signalType: pa.signalType },
    });
    edges.push({
      id: `e-p-${pa.id}`,
      source: curId,
      target: pid,
      sourceHandle: null,
      style: { stroke: `${CHANNEL_META[pa.channel]?.color ?? "#8a8a82"}80`, strokeDasharray: "6 4", strokeWidth: 1.5 },
    });
  });

  return { nodes, edges };
}

function buildFullGraph(campaign: CampaignDefinition, session: SimulationSession, onSelect: Props["onSelect"]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const takenStages = new Set(session.steps.map((s) => s.stageId));

  // Simple BFS layering from the entry stage.
  const entry = campaign.stages.find((s) => s.isEntry) ?? campaign.stages[0];
  const layer = new Map<string, number>();
  const queue: string[] = [entry.id];
  layer.set(entry.id, 0);
  while (queue.length) {
    const id = queue.shift()!;
    const stage = campaign.stages.find((s) => s.id === id);
    if (!stage) continue;
    for (const r of stage.availableResponses) {
      const ns = r.nextAction.nextStageId;
      if (ns && !layer.has(ns)) {
        layer.set(ns, (layer.get(id) ?? 0) + 1);
        queue.push(ns);
      }
    }
  }

  const perLayer = new Map<number, number>();
  campaign.stages.forEach((stage) => {
    const l = layer.get(stage.id) ?? 0;
    const idx = perLayer.get(l) ?? 0;
    perLayer.set(l, idx + 1);
    nodes.push({
      id: stage.id,
      type: "action",
      position: { x: l * 300, y: idx * 150 },
      data: {
        label: stage.label,
        channel: stage.channel,
        dayLabel: stage.dayLabel,
        action: stage.directAction,
        active: stage.id === session.pendingStageId,
      },
    });
  });

  const maxLayer = Math.max(...Array.from(layer.values()), 0);
  const outcomeLayerX = (maxLayer + 1) * 300;
  const referencedOutcomes = new Set<string>();
  campaign.stages.forEach((s) => s.availableResponses.forEach((r) => r.nextAction.outcomeId && referencedOutcomes.add(r.nextAction.outcomeId)));
  const outcomeList = campaign.outcomes.filter((o) => referencedOutcomes.has(o.id));
  outcomeList.forEach((o, i) => {
    nodes.push({
      id: `outcome-${o.id}`,
      type: "outcome",
      position: { x: outcomeLayerX, y: i * 90 },
      data: { label: o.label, outcomeId: o.id },
    });
  });

  campaign.stages.forEach((stage) => {
    stage.availableResponses.forEach((r) => {
      const sm = STRENGTH_META[r.strength];
      if (r.nextAction.nextStageId) {
        edges.push({
          id: `fe-${stage.id}-${r.id}`,
          source: stage.id,
          target: r.nextAction.nextStageId,
          label: r.label,
          labelStyle: { fontSize: 9, fill: "#64748b" },
          style: { stroke: sm.color, strokeDasharray: "2 3", strokeWidth: takenStages.has(stage.id) ? 2 : 1 },
        });
      } else if (r.nextAction.outcomeId) {
        edges.push({
          id: `fe-${stage.id}-${r.id}`,
          source: stage.id,
          target: `outcome-${r.nextAction.outcomeId}`,
          style: { stroke: sm.color, strokeDasharray: "2 3", strokeWidth: 1 },
        });
      }
    });
  });

  return { nodes, edges };
}

function CanvasInner({ campaign, session, showAll, onSelect }: Props) {
  const { fitView } = useReactFlow();
  const { nodes, edges } = useMemo(
    () => (showAll ? buildFullGraph(campaign, session, onSelect) : buildFocusedGraph(campaign, session, onSelect)),
    [campaign, session, showAll, onSelect],
  );

  const centerActive = useCallback(() => {
    fitView({ nodes: [{ id: showAll ? session.pendingStageId ?? "" : "current" }], duration: 400, padding: 0.4 });
  }, [fitView, showAll, session.pendingStageId]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={1.6}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      className="board-grid"
    >
      <Background color="#1f24300f" gap={22} />
      <MiniMap pannable zoomable nodeStrokeWidth={2} className="!bg-white/80" />
      <Controls showInteractive={false} />
      <div className="absolute top-3 right-3 z-10">
        <button className="btn-ghost text-xs !py-1.5" onClick={centerActive}>
          Center active stage
        </button>
      </div>
    </ReactFlow>
  );
}

export function WorkflowCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
