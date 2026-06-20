import type { UserRole } from "@prisma/client";

export type AgentSkill = {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  disclaimer: string;
  allowedRoles: UserRole[];
  starterPrompts: string[];
};

export const AGENT_DISCLAIMER =
  "Advisory only — lawyer must verify all outputs before use with clients or Home Affairs.";
