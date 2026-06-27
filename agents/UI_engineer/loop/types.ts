export type PlanStepType =
  | "action"
  | "reason"
  | "tool_call"
  | "condition";

export interface PlanStep {
  id: string;
  type: PlanStepType;
  description: string;

  // optional execution metadata
  tool?: string;
  input?: Record<string, any>;

  // for branching / future extension
  dependsOn?: string[];
}

export interface Plan {
  goal: string;
  steps: PlanStep[];
}

export type ExecutionResult = {
  stepId: string;
  status: "success" | "failed" | "skipped";
  output?: any;
  error?: string;
};

export interface ExecutorConfig {
  enableReasoningSteps?: boolean;
  toolRegistry?: ToolRegistry;
}

export interface ToolRegistry {
  execute: (tool: string, input: any) => Promise<any>;
}

/**
 * One row in runtime/failures.jsonl.
 * Append-only across all sessions; rows are tagged with session_id and filtered on read.
 */
export interface FailureRecord {
  session_id: string;
  iteration: number;
  timestamp: string;
  stepId?: string;
  /** Plain-English description of what the step was trying to accomplish. */
  stepDescription?: string;
  /** The tool the step invoked (if any) — e.g. "read_file". */
  tool?: string;
  /** The exact input the tool was called with, so the LLM sees the attempted shape. */
  toolInput?: Record<string, unknown>;
  signal: string;
  severity: "error" | "warning";
  /** Raw error message from the executor or verifier. */
  message: string;
  /** Optional extra context: log excerpt, file path, build output snippet, etc. */
  evidence?: string;
}

/**
 * Per-iteration detail kept in state.yml.
 * When the detail window exceeds the threshold, the oldest N IterationRecords
 * are folded into one SummaryRecord by the Summarizer.
 */
export interface IterationRecord {
  type: "iteration";
  iteration: number;
  timestamp: string;
  plan: {
    goal: string;
    steps: Array<{
      id: string;
      type: PlanStepType;
      tool?: string;
      description: string;
    }>;
  };
  results: Array<{
    stepId: string;
    status: ExecutionResult["status"];
    error?: string;
  }>;
  verification: {
    status: string;
    score: number;
    failedSteps: string[];
    summary: string;
  };
}

/**
 * Frozen compaction event covering a contiguous range of past iterations.
 * Written once, never edited. Lives inline with IterationRecords in
 * SessionState.iterations to keep a single chronological timeline.
 */
export interface SummaryRecord {
  type: "summary";
  covers: { from: number; to: number };
  timestamp: string;
  text: string;
}

export type SessionEntry = IterationRecord | SummaryRecord;

/**
 * In-memory session state, mirrored to runtime/state.yml.
 * Grows within a session; resets between sessions unless resumed.
 *
 * `iterations` is a chronological log of entries: each is either a full
 * IterationRecord or a SummaryRecord that compacts a past range. The order
 * is always [summary*, iteration*] — summaries precede live entries.
 */
export interface SessionState {
  session_id: string;
  started_at: string;
  goal: string;
  status: "running" | "succeeded" | "failed" | "halted";
  iterations: SessionEntry[];
}

