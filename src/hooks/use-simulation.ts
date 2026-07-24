import { useCallback, useEffect, useReducer } from "react";
import type { AccountProfile, CampaignId, SimulationSession, SimulationStep } from "../domain/types";
import { simReducer } from "../domain/simulation-reducer";
import { readLocalStorage } from "./use-local-storage";

const STORAGE_KEY = "chc-campaign-simulator:session";

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `sess-${Math.floor(Math.random() * 1e9).toString(16)}`;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

const initial = { session: readLocalStorage<SimulationSession>(STORAGE_KEY) };

export function useSimulation() {
  const [state, dispatch] = useReducer(simReducer, initial);

  // Persist the active session on every change.
  useEffect(() => {
    try {
      if (state.session) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, [state.session]);

  const start = useCallback((campaignId: CampaignId, account: AccountProfile) => {
    dispatch({ type: "START", campaignId, account, createdAt: nowIso(), id: newId() });
  }, []);

  const selectResponse = useCallback((stageId: string, responseId: string) => {
    dispatch({ type: "SELECT_RESPONSE", stageId, responseId });
  }, []);

  const rewindToStep = useCallback((stepIndex: number) => {
    dispatch({ type: "REWIND_TO_STEP", stepIndex });
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const importSession = useCallback((session: SimulationSession) => {
    dispatch({ type: "IMPORT", session });
  }, []);

  // Start a campaign directly from a preset list of steps (scenarios).
  const startFromScenario = useCallback(
    (campaignId: CampaignId, account: AccountProfile, steps: SimulationStep[]) => {
      const createdAt = nowIso();
      const id = newId();
      const seed: SimulationSession = {
        id,
        campaignId,
        account,
        currentStageId: "",
        currentPersonaId: account.primaryPersonaId,
        currentChannel: "preparation",
        currentDay: 0,
        status: "active",
        awarenessState: "unaware",
        engagementState: "none",
        contactPressure: 0,
        scheduledOutreachActive: true,
        physicalLocked: false,
        contactCorrected: false,
        history: [],
        scheduledActions: [],
        notes: [],
        createdAt,
        steps,
        pressureWarning: false,
      };
      dispatch({ type: "IMPORT", session: seed });
    },
    [],
  );

  const clearSession = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    dispatch({ type: "REPLACE", session: undefined as unknown as SimulationSession });
  }, []);

  return {
    session: state.session,
    start,
    startFromScenario,
    selectResponse,
    rewindToStep,
    reset,
    importSession,
    clearSession,
  };
}
