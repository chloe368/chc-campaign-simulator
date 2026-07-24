import type { SimulationSession } from "../domain/types";

export interface ExportEnvelope {
  format: "chc-campaign-simulator";
  version: 1;
  exportedAt: string;
  session: SimulationSession;
}

export function exportSession(session: SimulationSession): string {
  const envelope: ExportEnvelope = {
    format: "chc-campaign-simulator",
    version: 1,
    exportedAt: new Date().toISOString(),
    session,
  };
  return JSON.stringify(envelope, null, 2);
}

export function downloadSession(session: SimulationSession): void {
  const blob = new Blob([exportSession(session)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `campaign-simulation-${session.campaignId}-${session.id.slice(0, 8)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
