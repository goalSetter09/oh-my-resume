import type { AgentConfig } from "./types"
import { interviewPrepAgent } from "./interview-prep"

export const builtinAgents: Record<string, AgentConfig> = {
  "interview-prep": interviewPrepAgent,
}

export * from "./types"
export * from "./interview-prep"
