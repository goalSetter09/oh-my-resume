/**
 * Agent type definitions for Oh-My-Resume agent system
 */

/**
 * Agent category classification
 * - exploration: Fast search and codebase navigation
 * - specialist: Domain-specific execution tasks
 * - advisor: Deep analysis and consultation
 * - utility: General-purpose helper functions
 */
export type AgentCategory = "exploration" | "specialist" | "advisor" | "utility"

/**
 * Cost classification for orchestrator decision-making
 * - FREE: Cheap/free models, use liberally
 * - CHEAP: Affordable models, use for most tasks
 * - EXPENSIVE: High-cost models, use sparingly for complex tasks
 */
export type AgentCost = "FREE" | "CHEAP" | "EXPENSIVE"

/**
 * Trigger definition for orchestrator delegation
 */
export interface AgentTrigger {
  domain: string
  trigger: string
}

/**
 * Metadata for agent prompt and orchestration
 * Used by orchestrator to decide when to delegate to this agent
 */
export interface AgentPromptMetadata {
  /** Agent classification category */
  category: AgentCategory
  
  /** Cost tier for resource management */
  cost: AgentCost
  
  /** Display name in Sisyphus prompt */
  promptAlias?: string
  
  /** Delegation triggers for orchestrator */
  triggers: AgentTrigger[]
  
  /** Scenarios when this agent should be used */
  useWhen: string[]
  
  /** Scenarios when this agent should NOT be used */
  avoidWhen: string[]
}

/**
 * Agent configuration interface
 * Matches @opencode-ai/sdk AgentConfig structure
 */
export interface AgentConfig {
  /** Human-readable description */
  description: string
  
  /** Execution mode */
  mode: "subagent" | "primary"
  
  /** Model identifier */
  model: string
  
  /** Temperature for generation (0.0-1.0) */
  temperature?: number
  
  /** System prompt */
  prompt: string
  
  /** Disabled tools list */
  disabledTools?: string[]
  
  /** Thinking configuration for deep reasoning */
  thinking?: {
    type: "enabled" | "disabled"
    budgetTokens?: number
  }
}

/**
 * Built-in agent names registry
 */
export type BuiltinAgentName =
  | "interview-prep"
