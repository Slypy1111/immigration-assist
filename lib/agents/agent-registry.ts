import type { UserRole } from "@prisma/client";
import type { AgentSkill } from "./types";
import {
  documentDrafterSkill,
  checklistAdvisorSkill,
  clientCommsCoachSkill,
  caseReadinessReviewerSkill,
} from "./skills";

const ALL_AGENTS: AgentSkill[] = [
  documentDrafterSkill,
  checklistAdvisorSkill,
  clientCommsCoachSkill,
  caseReadinessReviewerSkill,
];

export function getAllAgents(): AgentSkill[] {
  return ALL_AGENTS;
}

export function getAgentById(id: string): AgentSkill | undefined {
  return ALL_AGENTS.find((a) => a.id === id);
}

export function getAgentsForRole(role: UserRole): AgentSkill[] {
  return ALL_AGENTS.filter((a) => a.allowedRoles.includes(role));
}

export function isAgentAllowed(agentId: string, role: UserRole): boolean {
  const agent = getAgentById(agentId);
  if (!agent) return false;
  return agent.allowedRoles.includes(role);
}
