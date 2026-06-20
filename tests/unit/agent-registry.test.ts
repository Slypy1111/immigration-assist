import { describe, it, expect } from "vitest";
import {
  getAllAgents,
  getAgentById,
  getAgentsForRole,
  isAgentAllowed,
} from "@/lib/agents/agent-registry";

describe("agent registry", () => {
  it("registers 4 MVP agents", () => {
    expect(getAllAgents()).toHaveLength(4);
  });

  it("finds agent by id", () => {
    const agent = getAgentById("checklist-advisor");
    expect(agent?.name).toBe("Checklist Advisor");
  });

  it("filters agents by lawyer role", () => {
    const agents = getAgentsForRole("LAWYER");
    expect(agents.length).toBe(4);
    expect(agents.every((a) => a.allowedRoles.includes("LAWYER"))).toBe(true);
  });

  it("denies client role for lawyer-only agents", () => {
    expect(isAgentAllowed("document-drafter", "CLIENT")).toBe(false);
    expect(isAgentAllowed("document-drafter", "LAWYER")).toBe(true);
  });

  it("each agent has disclaimer and starter prompts", () => {
    for (const agent of getAllAgents()) {
      expect(agent.disclaimer.length).toBeGreaterThan(10);
      expect(agent.starterPrompts.length).toBeGreaterThanOrEqual(2);
      expect(agent.systemPrompt).toContain("lawyer");
    }
  });
});
