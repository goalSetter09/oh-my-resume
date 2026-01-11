/**
 * Permission compatibility utilities for agent tool restrictions
 * Based on Oh-My-OpenCode agent architecture
 */

export type RestrictedTool =
  | "write"
  | "edit"
  | "task"
  | "sisyphus_task"
  | "call_omo_agent"
  | "interactive_bash"
  | "skill_mcp"

export interface AgentToolRestrictions {
  disabledTools?: string[]
}

/**
 * Creates tool restrictions for an agent
 * 
 * @param blockedTools - Array of tool names to block
 * @returns Object with disabledTools array for agent config
 * 
 * @example
 * // Read-only agent (blocks file modifications)
 * createAgentToolRestrictions(["write", "edit"])
 * 
 * // Executor agent (all tools allowed)
 * createAgentToolRestrictions([])
 * 
 * // Searcher agent (blocks modifications and delegation)
 * createAgentToolRestrictions(["write", "edit", "task", "sisyphus_task", "call_omo_agent"])
 */
export function createAgentToolRestrictions(
  blockedTools: RestrictedTool[]
): AgentToolRestrictions {
  if (blockedTools.length === 0) {
    return {}
  }

  return {
    disabledTools: blockedTools,
  }
}
