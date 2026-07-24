import { describe, it, expect } from "vitest";
import { validateCampaign, validateAllCampaigns } from "../domain/campaign-validator";
import { CAMPAIGNS } from "../data/campaigns";
import type { CampaignDefinition } from "../domain/types";
import { STANDARD_OUTCOMES } from "../data/shared";

describe("campaign-validator", () => {
  it("finds no errors in any shipped campaign", () => {
    const issues = validateAllCampaigns(CAMPAIGNS).filter((i) => i.level === "error");
    expect(issues, JSON.stringify(issues, null, 2)).toHaveLength(0);
  });

  it("reports no unreachable-stage warnings for shipped campaigns", () => {
    const warnings = validateAllCampaigns(CAMPAIGNS).filter((i) => i.code === "unreachable-stage");
    expect(warnings, JSON.stringify(warnings, null, 2)).toHaveLength(0);
  });

  it("detects an action without response options", () => {
    const broken: CampaignDefinition = {
      id: "email-led",
      name: "x",
      description: "",
      bestFor: "",
      primaryStrength: "",
      uniqueStrength: "",
      whyItWorks: [],
      mainChannels: ["email"],
      period: "",
      outcomes: STANDARD_OUTCOMES,
      stages: [
        { id: "a", isEntry: true, label: "A", dayLabel: "", channel: "email", objective: "", task: "", directAction: "", explanation: "", parallelActions: [], availableResponses: [] },
      ],
    };
    const codes = validateCampaign(broken).map((i) => i.code);
    expect(codes).toContain("action-without-response");
  });

  it("detects an invalid next-stage id and a dead end", () => {
    const broken: CampaignDefinition = {
      id: "email-led",
      name: "x",
      description: "",
      bestFor: "",
      primaryStrength: "",
      uniqueStrength: "",
      whyItWorks: [],
      mainChannels: ["email"],
      period: "",
      outcomes: STANDARD_OUTCOMES,
      stages: [
        {
          id: "a",
          isEntry: true,
          label: "A",
          dayLabel: "",
          channel: "email",
          objective: "",
          task: "",
          directAction: "",
          explanation: "",
          parallelActions: [],
          availableResponses: [
            {
              id: "r",
              label: "r",
              description: "",
              strength: "passive-awareness",
              condition: "",
              nextAction: { label: "", explanation: "", nextStageId: "does-not-exist" },
              effects: [],
            },
          ],
        },
      ],
    };
    const codes = validateCampaign(broken).map((i) => i.code);
    expect(codes).toContain("invalid-next-stage");
    expect(codes).toContain("no-exit");
  });

  it("detects an opt-out branch that does not stop outreach", () => {
    const broken: CampaignDefinition = {
      id: "email-led",
      name: "x",
      description: "",
      bestFor: "",
      primaryStrength: "",
      uniqueStrength: "",
      whyItWorks: [],
      mainChannels: ["email"],
      period: "",
      outcomes: STANDARD_OUTCOMES,
      stages: [
        {
          id: "a",
          isEntry: true,
          label: "A",
          dayLabel: "",
          channel: "email",
          objective: "",
          task: "",
          directAction: "",
          explanation: "",
          parallelActions: [],
          availableResponses: [
            {
              id: "r",
              label: "r",
              description: "",
              strength: "stop",
              condition: "",
              nextAction: { label: "", explanation: "", outcomeId: "opt-out" },
              effects: [], // missing suppress/pause
            },
          ],
        },
      ],
    };
    const codes = validateCampaign(broken).map((i) => i.code);
    expect(codes).toContain("optout-no-stop");
  });

  it("detects a positive branch that does not pause the campaign", () => {
    const broken: CampaignDefinition = {
      id: "email-led",
      name: "x",
      description: "",
      bestFor: "",
      primaryStrength: "",
      uniqueStrength: "",
      whyItWorks: [],
      mainChannels: ["email"],
      period: "",
      outcomes: STANDARD_OUTCOMES,
      stages: [
        {
          id: "a",
          isEntry: true,
          label: "A",
          dayLabel: "",
          channel: "email",
          objective: "",
          task: "",
          directAction: "",
          explanation: "",
          parallelActions: [],
          availableResponses: [
            {
              id: "r",
              label: "r",
              description: "",
              strength: "positive",
              condition: "",
              nextAction: { label: "", explanation: "", outcomeId: "meeting-booked" },
              effects: [], // no pause
            },
          ],
        },
      ],
    };
    const codes = validateCampaign(broken).map((i) => i.code);
    expect(codes).toContain("positive-no-pause");
  });

  it("detects a physical-rejection branch that routes to another physical delivery", () => {
    const broken: CampaignDefinition = {
      id: "physical-mail-led",
      name: "x",
      description: "",
      bestFor: "",
      primaryStrength: "",
      uniqueStrength: "",
      whyItWorks: [],
      mainChannels: ["physical"],
      period: "",
      outcomes: STANDARD_OUTCOMES,
      stages: [
        {
          id: "a",
          isEntry: true,
          label: "A",
          dayLabel: "",
          channel: "physical",
          objective: "",
          task: "",
          directAction: "",
          explanation: "",
          parallelActions: [],
          availableResponses: [
            {
              id: "reject",
              label: "reject",
              description: "",
              strength: "negative",
              condition: "",
              nextAction: { label: "", explanation: "", nextStageId: "b" },
              effects: [{ type: "lock-physical" }],
            },
          ],
        },
        {
          id: "b",
          label: "B",
          dayLabel: "",
          channel: "physical",
          objective: "",
          task: "",
          directAction: "",
          explanation: "",
          parallelActions: [],
          availableResponses: [
            {
              id: "done",
              label: "done",
              description: "",
              strength: "passive-awareness",
              condition: "",
              nextAction: { label: "", explanation: "", outcomeId: "clean-close" },
              effects: [],
            },
          ],
        },
      ],
    };
    const codes = validateCampaign(broken).map((i) => i.code);
    expect(codes).toContain("physical-after-rejection");
  });
});
