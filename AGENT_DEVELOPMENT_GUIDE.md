# The Hitchhiker's Guide to Agent Development

> Oh-My-OpenCode 커밋 히스토리 분석을 기반으로 작성된 에이전트 개발 완벽 가이드

---

## Table of Contents

1. [Part 1: 에이전트 개발의 이해](#part-1-에이전트-개발의-이해)
   - [1.1 프로젝트 구조](#11-프로젝트-구조)
   - [1.2 에이전트 vs 스킬](#12-에이전트-vs-스킬)
   - [1.3 3가지 에이전트 아키타입](#13-3가지-에이전트-아키타입)
2. [Part 2: 개발 순서 및 팁 (커밋 히스토리 분석)](#part-2-개발-순서-및-팁-커밋-히스토리-분석)
   - [2.1 Oh-My-OpenCode 개발 타임라인](#21-oh-my-opencode-개발-타임라인)
   - [2.2 핵심 개발 순서](#22-핵심-개발-순서)
   - [2.3 프롬프트 엔지니어링 기법](#23-프롬프트-엔지니어링-기법)
   - [2.4 실전 개발 팁](#24-실전-개발-팁)
3. [Part 3: 실전 에이전트 만들기 (Step-by-Step)](#part-3-실전-에이전트-만들기-step-by-step)
   - [3.1 파일 구조](#31-파일-구조)
   - [3.2 메타데이터 정의](#32-메타데이터-정의)
   - [3.3 팩토리 함수 구현](#33-팩토리-함수-구현)
   - [3.4 에이전트 등록](#34-에이전트-등록)
4. [Part 4: Interview Prep Agent 개발 계획](#part-4-interview-prep-agent-개발-계획)
   - [4.1 에이전트 설계](#41-에이전트-설계)
   - [4.2 개발 단계](#42-개발-단계)
   - [4.3 구현 코드 청사진](#43-구현-코드-청사진)
5. [Appendix: 코드 템플릿](#appendix-코드-템플릿)

---

# Part 1: 에이전트 개발의 이해

## 1.1 프로젝트 구조

Oh-My-OpenCode의 에이전트 관련 디렉토리 구조:

```
src/
├── agents/                    # 에이전트 정의
│   ├── index.ts               # 에이전트 레지스트리 (builtinAgents export)
│   ├── types.ts               # 타입 정의 (AgentPromptMetadata, BuiltinAgentName)
│   ├── utils.ts               # 유틸리티 함수 (createBuiltinAgents)
│   ├── explore.ts             # 탐색 에이전트 (126줄)
│   ├── oracle.ts              # 컨설턴트 에이전트 (125줄)
│   ├── frontend-ui-ux-engineer.ts  # 실행 에이전트 (110줄)
│   ├── librarian.ts           # 문서/연구 에이전트
│   ├── document-writer.ts     # 문서 작성 에이전트
│   └── ...
├── tools/                     # 도구 정의
├── hooks/                     # 이벤트 훅
├── features/
│   ├── builtin-skills/        # 스킬 정의
│   │   ├── skills.ts          # 내장 스킬 (playwright, frontend-ui-ux, git-master)
│   │   └── frontend-ui-ux/SKILL.md
│   └── background-agent/      # 백그라운드 에이전트 관리
└── shared/
    └── permission-compat.ts   # 권한 시스템 유틸리티
```

## 1.2 에이전트 vs 스킬

| 구분 | 에이전트 (Agent) | 스킬 (Skill) |
|------|------------------|--------------|
| **정의** | "어떻게" 생각할지 | "무엇을" 알지 |
| **내용** | 모델, 온도, 기본 마인드셋 | 도메인 지식, 추가 도구 |
| **사용** | 독립 실행 가능 | 다른 에이전트에 주입 |
| **예시** | `@oracle`, `@explore` | `skills=["playwright"]` |
| **조합** | 하나만 선택 | 여러 개 동시 사용 가능 |

### 언제 에이전트를, 언제 스킬을?

```
┌─────────────────────────────────────────────────────────┐
│  "독립적인 전문가가 필요하다" → 에이전트 생성           │
│  "기존 에이전트에 능력을 추가하고 싶다" → 스킬 생성     │
└─────────────────────────────────────────────────────────┘
```

## 1.3 3가지 에이전트 아키타입

### Type 1: Searcher (탐색형) - Explore 패턴

```typescript
// 특징: 읽기 전용, 빠른 검색, 저렴한 모델
const restrictions = createAgentToolRestrictions([
  "write", "edit", "task", "sisyphus_task", "call_omo_agent"
])

model: "opencode/grok-code"  // FREE
temperature: 0.1             // 일관된 결과
```

**사용 시점**: 코드베이스 탐색, 패턴 찾기, "어디에 X가 있어?"

### Type 2: Consultant (컨설턴트형) - Oracle 패턴

```typescript
// 특징: 읽기 전용, 깊은 사고, 비싼 모델
const restrictions = createAgentToolRestrictions([
  "write", "edit", "task"
])

model: "openai/gpt-5.2"      // EXPENSIVE
thinking: { type: "enabled", budgetTokens: 32000 }  // 깊은 사고
```

**사용 시점**: 아키텍처 결정, 디버깅, 코드 리뷰, 전략적 조언

### Type 3: Executor (실행형) - Frontend-UI-UX 패턴

```typescript
// 특징: 파일 수정 가능, 작업 실행
const restrictions = createAgentToolRestrictions([])  // 빈 배열!

model: "google/gemini-3-pro-preview"  // CHEAP
// temperature: 기본값 (창의성 허용)
```

**사용 시점**: 실제 코드 작성, 구현 작업, 파일 생성/수정

### 비교 표

| 속성 | Searcher | Consultant | Executor |
|------|----------|------------|----------|
| 파일 수정 | ❌ | ❌ | ✅ |
| 모델 비용 | FREE | EXPENSIVE | CHEAP |
| Thinking | ❌ | ✅ | ❌ |
| 주요 도구 | grep, glob, lsp | read, analyze | write, edit, 전체 |
| 카테고리 | exploration | advisor | specialist |

---

# Part 2: 개발 순서 및 팁 (커밋 히스토리 분석)

## 2.1 Oh-My-OpenCode 개발 타임라인

커밋 히스토리를 역순으로 분석한 결과, 개발은 다음 순서로 진행되었습니다:

```
2025-12-03 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ✨ Fiat Lux (프로젝트 시작)
            │
            ├─ chore: initialize project with bun and typescript
            │
            ├─ feat(agent): add oracle agent          ← 1번째 에이전트
            ├─ feat(agent): add librarian agent       ← 2번째 에이전트
            ├─ feat(agent): add explore agent         ← 3번째 에이전트
            │
            ├─ feat: wire up agents and expose via opencode plugin
            │
            ├─ feat(agent): add frontend-ui-ux-engineer agent
            ├─ feat(agent): add document-writer agent
            │
2025-12 ~ 2026-01 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            │
            ├─ feat(hook): add todo-continuation-enforcer
            ├─ feat(lsp): add LSP tools integration
            ├─ feat(tools): add ast-grep tools
            ├─ feat(mcp): add websearch_exa, context7
            │
2026-01 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            │
            └─ THE ORCHESTRATOR (#600) ← 대규모 오케스트레이션
               ├─ feat(agents): add orchestrator-sisyphus
               ├─ feat(agents): add Metis, Momus
               ├─ feat(tools): add sisyphus_task
               └─ feat(skills): add frontend-ui-ux, git-master
```

## 2.2 핵심 개발 순서

### Step 1: 핵심 에이전트 먼저 (MVP)

```
Oracle → Librarian → Explore → (연결) → 전문 에이전트들
```

- **조언자(Oracle)** 먼저: 가장 핵심이 되는 "두뇌" 역할
- **연구자(Librarian)** 다음: 정보 수집 역할
- **탐색자(Explore)** 그 다음: 빠른 검색 역할
- **연결(wire up)**: 에이전트들을 시스템에 등록
- **전문가들**: Frontend, Document-Writer 등 도메인 특화

### Step 2: 인프라 구축

```
에이전트 완성 → 훅(Hooks) → 도구(Tools) → MCP 통합
```

- 에이전트가 안정화된 후에 인프라 확장
- 훅으로 자동화 기능 추가
- 도구로 에이전트 능력 확장

### Step 3: 오케스트레이션

```
개별 에이전트 → 오케스트레이터 → 스킬 시스템
```

- 여러 에이전트가 협업하는 시스템
- 스킬로 모듈화된 능력 주입

## 2.3 프롬프트 엔지니어링 기법

Frontend-UI-UX 에이전트 분석에서 추출한 핵심 기법들:

### 기법 1: 페르소나 설정 (Identity Framing)

```markdown
You are a designer who learned to code. You see what pure developers miss—
spacing, color harmony, micro-interactions, that indefinable "feel" that 
makes interfaces memorable.
```

**효과**: 
- 일반 개발자와 차별화된 관점 부여
- 감성적 언어로 역할 몰입 유도

### 기법 2: 번호 매긴 원칙 (Enumerated Principles)

```markdown
# Work Principles

1. **Complete what's asked** — Execute the exact task. No scope creep.
2. **Leave it better** — Ensure working state after changes.
3. **Study before acting** — Examine existing patterns.
4. **Blend seamlessly** — Match existing code patterns.
5. **Be transparent** — Report both successes and failures.
```

**효과**: 우선순위 명시, 요약+설명 구조화

### 기법 3: 의사결정 프레임워크 (Decision Framework)

```markdown
Before coding, commit to a **BOLD aesthetic direction**:

1. **Purpose**: What problem does this solve?
2. **Tone**: Pick an extreme—minimal, maximalist, retro-futuristic...
3. **Constraints**: Technical requirements
4. **Differentiation**: What's the ONE thing someone will remember?
```

**효과**: 코딩 전 "생각해야 할 것" 강제

### 기법 4: 안티패턴 명시 (Negative Examples)

```markdown
# Anti-Patterns (NEVER)

- Generic fonts (Inter, Roboto, Arial)
- Cliched color schemes (purple gradients on white)
- Predictable layouts
- Cookie-cutter design
```

**효과**: "하지 말 것"을 명시하면 LLM이 피함

### 기법 5: 조건부 가이드 (Conditional Guidance)

```markdown
Match implementation complexity to aesthetic vision:
- **Maximalist** → Elaborate code with extensive animations
- **Minimalist** → Restraint, precision, careful spacing
```

**효과**: 상황별 다른 행동 유도

## 2.4 실전 개발 팁

### Tip 1: 작게 시작하라

```
초기 에이전트들은 모두 100-150줄
→ 기능을 점진적으로 추가
```

### Tip 2: 도구 제한이 에이전트 유형을 결정

```typescript
createAgentToolRestrictions([])           // 실행 에이전트 (모든 도구)
createAgentToolRestrictions(["write"])    // 읽기 전용 에이전트
```

### Tip 3: 메타데이터로 오케스트레이션 지원

```typescript
export const MY_AGENT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "CHEAP",
  triggers: [{ domain: "My Domain", trigger: "When to use" }],
  useWhen: ["Scenario 1", "Scenario 2"],
  avoidWhen: ["When NOT to use"],
}
```

### Tip 4: 프롬프트 구조 일관성

```
Role → Principles → Process → Guidelines → Anti-Patterns → Execution
```

### Tip 5: XML 대신 Markdown

```
# 초기 버전 (❌)
<role>You are...</role>
<skill>...</skill>

# 현재 버전 (✅)
# Role
You are...

# Guidelines
...
```

### Tip 6: 에이전트 + 스킬 이중 구조

같은 프롬프트를 에이전트와 스킬 두 형태로 제공:
- 에이전트: 독립 실행 (`@frontend-ui-ux-engineer`)
- 스킬: 다른 에이전트에 주입 (`skills=["frontend-ui-ux"]`)

---

# Part 3: 실전 에이전트 만들기 (Step-by-Step)

## 3.1 파일 구조

새 에이전트를 만들 때 필요한 파일:

```
src/agents/
├── my-agent.ts        # 새로 생성
├── index.ts           # 수정 (등록)
└── types.ts           # 수정 (타입 추가)
```

## 3.2 메타데이터 정의

```typescript
import type { AgentPromptMetadata } from "./types"

export const MY_AGENT_METADATA: AgentPromptMetadata = {
  // 에이전트 분류
  category: "specialist",  // exploration | specialist | advisor | utility
  
  // 비용 분류 (오케스트레이터 참조)
  cost: "CHEAP",           // FREE | CHEAP | EXPENSIVE
  
  // Sisyphus 프롬프트에 표시될 이름
  promptAlias: "My Agent",
  
  // 오케스트레이터가 위임 결정할 때 참조
  triggers: [
    { domain: "Domain Name", trigger: "When to delegate to this agent" },
  ],
  
  // 사용 시점
  useWhen: [
    "Specific scenario 1",
    "Specific scenario 2",
  ],
  
  // 사용하지 말아야 할 시점
  avoidWhen: [
    "When not to use 1",
  ],
}
```

## 3.3 팩토리 함수 구현

```typescript
import type { AgentConfig } from "@opencode-ai/sdk"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5"

export function createMyAgent(model: string = DEFAULT_MODEL): AgentConfig {
  // 도구 제한 설정
  // 빈 배열 = 모든 도구 허용 (실행 에이전트)
  // ["write", "edit"] = 해당 도구 차단 (읽기 전용)
  const restrictions = createAgentToolRestrictions([
    "task",
    "sisyphus_task",
  ])

  return {
    // 에이전트 설명 (선택 UI에 표시)
    description: "에이전트 설명",
    
    // 모드: subagent (서브에이전트로 동작)
    mode: "subagent" as const,
    
    // 모델
    model,
    
    // 온도 (0.0-1.0, 낮을수록 일관성)
    temperature: 0.1,
    
    // 도구 제한 적용
    ...restrictions,
    
    // 시스템 프롬프트
    prompt: `# Role
[에이전트의 정체성과 미션]

# Principles
1. **원칙 1** — 설명
2. **원칙 2** — 설명

# Process
[작업 전 생각해야 할 프레임워크]

# Guidelines
[도메인별 상세 가이드]

# Anti-Patterns (NEVER)
- 하지 말아야 할 것 1
- 하지 말아야 할 것 2

# Output Format
[출력 형식 정의]
`,
  }
}

// 기본 인스턴스 export
export const myAgent = createMyAgent()
```

## 3.4 에이전트 등록

### `src/agents/index.ts` 수정

```typescript
import { myAgent } from "./my-agent"

export const builtinAgents: Record<string, AgentConfig> = {
  Sisyphus: sisyphusAgent,
  oracle: oracleAgent,
  // ... 기존 에이전트들
  
  // 새 에이전트 추가
  "my-agent": myAgent,
}
```

### `src/agents/types.ts` 수정

```typescript
export type BuiltinAgentName =
  | "Sisyphus"
  | "oracle"
  // ... 기존 이름들
  | "my-agent"  // 추가
```

---

# Part 4: Interview Prep Agent 개발 계획

## 4.1 에이전트 설계

### 기본 정보

| 속성 | 값 |
|------|-----|
| **이름** | `interview-prep` |
| **유형** | Consultant + Specialist 혼합 |
| **권한** | `read` (이력서 읽기), `write` (리포트 저장) - 선택적 |
| **모델** | `anthropic/claude-sonnet-4-5` |
| **비용** | CHEAP |

### 핵심 기능

1. **이력서 파싱**: PDF/Markdown/Text 형식 이해, 핵심 역량/경험 추출
2. **질문 생성 (Q-Gen)**:
   - **검증형**: 경력 기술서 사실 확인
   - **심층형**: 기술적 깊이 확인
   - **인성형**: 팀워크, 갈등 해결
3. **답변 가이드 (A-Guide)**: STAR 기법 기반 모범 답안 구조 제시

### 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                  Interview Prep Agent                    │
├─────────────────────────────────────────────────────────┤
│  Input: 이력서 (텍스트/파일 경로)                        │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   분석기    │→ │  질문 생성  │→ │  답변 가이드 │      │
│  │  (Parser)   │  │  (Q-Gen)    │  │  (A-Guide)  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
│  Output: 질문 리스트 + STAR 기반 답변 가이드             │
└─────────────────────────────────────────────────────────┘
```

## 4.2 개발 단계

### Phase 1: 기본 구조 생성

1. **파일 생성**: `src/agents/interview-prep.ts`
2. **메타데이터 정의**:
   - `category`: `"advisor"`
   - `triggers`: 이력서 분석, 면접 준비 관련
3. **권한 설정**: `task`, `sisyphus_task` 차단 (복잡한 위임 방지)

### Phase 2: 프롬프트 엔지니어링

프롬프트 구조:

```
# Role
15년 차 시니어 테크 리크루터 + 면접관 페르소나

# Mission
이력서 분석 → 현실적 면접 시뮬레이션 → STAR 기법 답변 가이드

# Process
1. Analyze: 이력서 읽기, 핵심 기술/성과/공백 식별
2. Strategize: 면접 유형 결정 (알고리즘/시스템설계/행동/이력서심층)
3. Generate: 타겟 질문 생성
4. Guide: 각 질문에 대한 Gold Standard 답변 구조

# Question Types
- Validation: 사실 확인 질문
- Deep Dive: 기술적 깊이 질문
- Behavioral: 행동/인성 질문

# Output Format
Q1. [질문]
- Intent: 면접관이 진짜 알고 싶은 것
- Key Points: 반드시 언급해야 할 2-3가지
- STAR Guide: S/T, A, R 각각 어떻게 구성할지
```

### Phase 3: 도구 및 스킬 통합

- **필수 도구**: `read` (이력서 읽기)
- **선택 도구**: `write` (결과 리포트 저장)
- **참조**: PDF 이력서 → `look-at` 도구 활용 고려

### Phase 4: 등록 및 테스트

1. `index.ts`에 등록
2. `types.ts`에 타입 추가
3. 테스트 시나리오:
   - 샘플 이력서 → "면접 질문 5개 생성"
   - 특정 프로젝트 → "기술 면접 질문"

## 4.3 구현 코드 청사진

```typescript
// src/agents/interview-prep.ts

import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메타데이터
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const INTERVIEW_PREP_METADATA: AgentPromptMetadata = {
  category: "advisor",
  cost: "CHEAP",
  promptAlias: "Interview Coach",
  triggers: [
    { 
      domain: "Interview Preparation", 
      trigger: "Resume analysis, mock interview questions, answer coaching" 
    },
  ],
  useWhen: [
    "User provides resume or CV",
    "Preparing for job interview",
    "Need mock interview questions",
    "Want to practice STAR method answers",
  ],
  avoidWhen: [
    "Actual resume writing or editing",
    "Job search strategy",
    "Salary negotiation",
  ],
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 팩토리 함수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function createInterviewPrepAgent(
  model: string = DEFAULT_MODEL
): AgentConfig {
  // 에이전트 위임 도구는 차단, 파일 읽기/쓰기는 허용
  const restrictions = createAgentToolRestrictions([
    "task",
    "sisyphus_task",
    "call_omo_agent",
  ])

  return {
    description:
      "Expert interview coach that analyzes resumes to generate tailored questions and STAR-method answers.",
    mode: "subagent" as const,
    model,
    temperature: 0.2, // 분석 중심이므로 낮게
    ...restrictions,
    prompt: INTERVIEW_PREP_PROMPT,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 시스템 프롬프트
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const INTERVIEW_PREP_PROMPT = `# Role

You are a Veteran Technical Interviewer and Career Coach with 15+ years of experience at top tech companies (Google, Meta, Amazon, etc.). You possess a sharp eye for identifying both strengths and gaps in resumes. You've conducted 1000+ interviews and know exactly what separates good candidates from great ones.

# Mission

Analyze the user's resume to simulate a realistic, high-bar interview scenario. Your goal is not just to ask questions, but to help the user articulate their value effectively using the STAR method (Situation, Task, Action, Result).

# Process

1. **Analyze**: Read the provided resume content carefully
   - Identify key technologies and skills
   - Note quantifiable achievements (and vague claims that need validation)
   - Spot potential red flags (gaps, short tenures, missing details)
   
2. **Strategize**: Determine the interview focus
   - Technical Deep Dive (for engineering roles)
   - System Design (for senior roles)
   - Behavioral/Leadership (for all levels)
   - Resume Verification (for suspicious claims)

3. **Generate**: Create a set of targeted questions
   - Mix of types (validation, deep-dive, behavioral)
   - Ordered from warm-up to challenging
   - Include follow-up questions for each

4. **Guide**: Provide "Gold Standard" answer structures
   - STAR framework for each question
   - Specific talking points to hit
   - Common pitfalls to avoid

# Question Types

## Type 1: Validation Questions
Purpose: Verify claims and dig into specifics
Examples:
- "You mentioned improving latency by 50%. How exactly did you measure this? What was the baseline?"
- "You said you 'led' this project. How many people were on the team? What decisions did YOU make?"

## Type 2: Deep Dive Questions
Purpose: Assess technical depth and problem-solving
Examples:
- "Why did you choose Redis over Memcached for this specific use case?"
- "Walk me through how you would debug a memory leak in this system."
- "What would you do differently if you could redesign this?"

## Type 3: Behavioral Questions
Purpose: Evaluate soft skills and cultural fit
Examples:
- "Tell me about a time you disagreed with a PM on feature scope."
- "Describe a situation where you had to deliver bad news to stakeholders."
- "How do you handle working with someone whose work quality is below expectations?"

# Output Format

For each question, provide this structure:

---

### Q[N]. [Question Text]

**Intent**: What is the interviewer REALLY looking for with this question?

**Key Points to Hit**: 
- [Point 1]: Why this matters
- [Point 2]: Why this matters
- [Point 3]: Why this matters

**STAR Guide**:
- **Situation/Task**: How to briefly set the context (1-2 sentences max)
- **Action**: What specific actions YOU took (use "I", not "we")
- **Result**: Quantifiable outcomes (numbers, metrics, impact)

**Common Pitfalls**:
- ❌ [What NOT to do]
- ❌ [What NOT to do]

**Sample Answer Framework**:
> "When I was at [Company], we faced [Situation]. My role was to [Task]. I specifically [Action 1], [Action 2], and [Action 3]. As a result, [Quantifiable Result]."

---

# Anti-Patterns (NEVER)

- Generic questions that could apply to anyone
- Softball questions without follow-ups
- Ignoring gaps or red flags in the resume
- Providing vague answer guidance without STAR structure
- Being overly encouraging without constructive criticism
- Missing opportunities to prepare for tough follow-up questions

# Principles

1. **Be Tough but Fair** — Ask the questions real interviewers ask, not the easy ones
2. **Specificity is King** — Vague questions get vague answers. Demand specifics.
3. **Follow the Thread** — Every answer leads to a follow-up. Prepare the user for this.
4. **Context Matters** — Tailor questions to the target role/company if specified
5. **Actionable Guidance** — Every piece of advice should be immediately usable
`

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 기본 인스턴스 export
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const interviewPrepAgent = createInterviewPrepAgent()
```

### 등록 코드

```typescript
// src/agents/index.ts 에 추가
import { interviewPrepAgent } from "./interview-prep"

export const builtinAgents: Record<string, AgentConfig> = {
  // ... 기존 에이전트들
  "interview-prep": interviewPrepAgent,
}
```

```typescript
// src/agents/types.ts 에 추가
export type BuiltinAgentName =
  | "Sisyphus"
  | "oracle"
  // ... 기존 이름들
  | "interview-prep"
```

---

# Appendix: 코드 템플릿

## A. 기본 에이전트 템플릿

```typescript
// src/agents/[agent-name].ts

import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentPromptMetadata } from "./types"
import { createAgentToolRestrictions } from "../shared/permission-compat"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 상수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_MODEL = "anthropic/claude-sonnet-4-5"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 메타데이터 (오케스트레이터 참조용)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const [AGENT_NAME]_METADATA: AgentPromptMetadata = {
  category: "specialist",    // exploration | specialist | advisor | utility
  cost: "CHEAP",             // FREE | CHEAP | EXPENSIVE
  promptAlias: "[Display Name]",
  triggers: [
    { domain: "[Domain]", trigger: "[When to use]" },
  ],
  useWhen: ["[Scenario 1]", "[Scenario 2]"],
  avoidWhen: ["[When NOT to use]"],
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 팩토리 함수
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function create[AgentName]Agent(
  model: string = DEFAULT_MODEL
): AgentConfig {
  const restrictions = createAgentToolRestrictions([
    // 차단할 도구 목록
    // 빈 배열 = 모든 도구 허용
  ])

  return {
    description: "[에이전트 설명]",
    mode: "subagent" as const,
    model,
    temperature: 0.1,
    ...restrictions,
    prompt: `# Role
[페르소나와 미션]

# Principles
1. **[원칙 1]** — [설명]
2. **[원칙 2]** — [설명]

# Process
[작업 프로세스]

# Guidelines
[상세 가이드]

# Anti-Patterns (NEVER)
- [하지 말 것 1]
- [하지 말 것 2]

# Output Format
[출력 형식]
`,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 기본 인스턴스
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const [agentName]Agent = create[AgentName]Agent()
```

## B. 스킬 템플릿 (SKILL.md)

```markdown
---
name: [skill-name]
description: [스킬 설명]
---

# Role: [역할]

[페르소나 설명]

**Mission**: [미션]

---

# Principles

1. **[원칙 1]** — [설명]
2. **[원칙 2]** — [설명]

---

# Guidelines

## [가이드라인 1]
[내용]

## [가이드라인 2]
[내용]

---

# Anti-Patterns (NEVER)

- [하지 말 것 1]
- [하지 말 것 2]
```

## C. 도구 제한 치트시트

```typescript
// 모든 도구 허용 (실행 에이전트)
createAgentToolRestrictions([])

// 파일 수정 불가 (읽기 전용 컨설턴트)
createAgentToolRestrictions(["write", "edit"])

// 파일 수정 + 에이전트 위임 불가 (독립 탐색)
createAgentToolRestrictions(["write", "edit", "task", "sisyphus_task", "call_omo_agent"])

// 특정 도구만 차단
createAgentToolRestrictions(["interactive_bash", "skill_mcp"])
```

---

## Quick Reference Card

### 에이전트 유형 결정

```
파일 수정 필요?
├── YES → Executor (restrictions = [])
└── NO → 깊은 분석 필요?
         ├── YES → Consultant (restrictions = ["write", "edit"], thinking = enabled)
         └── NO → Searcher (restrictions = [...], 저렴한 모델)
```

### 프롬프트 구조

```
# Role        ← 정체성
# Principles  ← 행동 원칙 (번호 매기기)
# Process     ← 작업 순서
# Guidelines  ← 상세 가이드
# Anti-Patterns ← 하지 말 것
# Output Format ← 출력 형식
```

### 필수 파일

```
src/agents/
├── my-agent.ts   # 새로 생성
├── index.ts      # 등록 추가
└── types.ts      # 타입 추가
```

---

*이 가이드는 Oh-My-OpenCode 레포지토리의 커밋 히스토리와 코드 분석을 기반으로 작성되었습니다.*

*마지막 업데이트: 2026-01-11*
