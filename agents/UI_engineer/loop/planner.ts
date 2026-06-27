import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { LlmClient, LlmImage } from "./llm";
import type { ToolsConfig } from "./tools/registry";
import { activeToolSpecs } from "./tools/registry";
import type { FailureRecord, Plan, PlanStep, SessionEntry } from "./types";
import type { VisualFeedback } from "./verifier";

const PLANNER_PROMPT_TEMPLATE = readFileSync(
  join(__dirname, "prompts", "planner.md"),
  "utf8",
);

export interface PlannerConfig {
  model?: string;
  maxSteps?: number;
  temperature?: number;
  retryLimit?: number;
  tools?: ToolsConfig;
}

/**
 * Planner is responsible for converting a high-level goal
 * into a deterministic, structured execution plan.
 */
export class Planner {
  private config: Required<Omit<PlannerConfig, "tools">> & {
    tools?: ToolsConfig;
  };
  private llm: LlmClient;
  private toolsBlock: string;

  constructor(llm: LlmClient, config: PlannerConfig = {}) {
    this.llm = llm;
    this.config = {
      maxSteps: config.maxSteps ?? 8,
      temperature: config.temperature ?? 0.2,
      model: config.model ?? "claude-sonnet-4-6",
      retryLimit: config.retryLimit ?? 2,
      tools: config.tools,
    };
    this.toolsBlock = this.config.tools
      ? this.renderToolsBlock(this.config.tools)
      : "";
  }

  private renderToolsBlock(tools: ToolsConfig): string {
    const active = activeToolSpecs(tools);
    const entries = Object.entries(active).map(([name, spec]) => {
      const schema = JSON.stringify(spec.input_schema ?? {}, null, 2);
      return `- ${name}: ${spec.description}\n  input_schema:\n${schema
        .split("\n")
        .map((l) => `    ${l}`)
        .join("\n")}`;
    });
    return `\nAvailable tools (use the exact name in step.tool and match input_schema for step.input):\n${entries.join("\n")}\n`;
  }

  /**
   * Main entry point
   */
  async createPlan(input: {
    goal: string;
    context?: string;
    recentFailures?: FailureRecord[];
    iterationHistory?: SessionEntry[];
    /** Reference design images attached to the planner LLM call. */
    designImages?: LlmImage[];
    /** Per-screen diff feedback from the previous iteration's visual verifier. */
    visualFeedback?: VisualFeedback[];
  }): Promise<Plan> {
    const {
      goal,
      context,
      recentFailures,
      iterationHistory,
      designImages,
      visualFeedback,
    } = input;
    const basePrompt = this.buildPrompt(
      goal,
      context,
      recentFailures,
      iterationHistory,
      designImages && designImages.length > 0,
      visualFeedback,
    );

    let lastError: string | undefined;
    let lastOutput: string | undefined;

    for (let attempt = 0; attempt <= this.config.retryLimit; attempt++) {
      const prompt =
        attempt === 0
          ? basePrompt
          : `${basePrompt}\n\nYour previous output was invalid:\n${lastError}\nOutput was:\n${lastOutput?.slice(0, 500)}\n\nReturn ONLY valid JSON.`;

      const raw = await this.callLLM(prompt, designImages);
      lastOutput = raw;

      try {
        const parsed = this.parsePlan(raw, goal);
        this.validatePlan(parsed);
        return parsed;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    throw new Error(
      `Planner failed after ${this.config.retryLimit + 1} attempts: ${lastError}`,
    );
  }

  /**
   * Prompt construction — loads template from prompts/planner.md
   * and appends goal + optional context + recent failures.
   */
  private buildPrompt(
    goal: string,
    context?: string,
    recentFailures?: FailureRecord[],
    iterationHistory?: SessionEntry[],
    hasDesignImages?: boolean,
    visualFeedback?: VisualFeedback[],
  ): string {
    const designSpecBlock = hasDesignImages
      ? `\nReference design images are ATTACHED to this message. They are the visual source of truth — match them exactly. Each image is labeled by filename so you can reference them by name in your plan steps.\n`
      : "";

    const visualFeedbackBlock =
      visualFeedback && visualFeedback.length > 0
        ? `\nVerifier feedback from the previous iteration — the implementation does NOT yet match the reference. Address every item below in this iteration's plan:\n${visualFeedback
            .map((f) => {
              const lines: string[] = [];
              lines.push(
                `- ${f.screen} (visual score: ${f.visualScore ?? "n/a"})`,
              );
              if (f.visualDifferences.length > 0) {
                lines.push("    visual differences vs reference:");
                for (const d of f.visualDifferences) lines.push(`      - ${d}`);
              }
              if (f.failedAssertions.length > 0) {
                lines.push("    failed functional assertions:");
                for (const a of f.failedAssertions) lines.push(`      - ${a}`);
              }
              return lines.join("\n");
            })
            .join("\n")}\n`
        : "";

    const historyBlock =
      iterationHistory && iterationHistory.length > 0
        ? `\nSession history (chronological — frozen summaries cover older ranges; later entries are full detail):\n${iterationHistory
            .map((e) => {
              if (e.type === "summary") {
                return `  [summary of iterations ${e.covers.from}-${e.covers.to}]\n    ${e.text.replace(/\n/g, "\n    ")}`;
              }
              const steps = e.plan.steps
                .map((s) => `    - ${s.id} [${s.tool ?? s.type}] ${s.description}`)
                .join("\n");
              return `  Iteration ${e.iteration} → ${e.verification.status} (score ${e.verification.score.toFixed(2)})\n${steps}`;
            })
            .join("\n")}\n`
        : "";

    const failuresBlock =
      recentFailures && recentFailures.length > 0
        ? `\nFailures from the previous iteration (analyze the pattern; do not repeat these mistakes):\n${recentFailures
            .map((f) => {
              const lines: string[] = [];
              lines.push(`- step ${f.stepId ?? "?"}: ${f.message}`);
              if (f.stepDescription) lines.push(`    intent: ${f.stepDescription}`);
              if (f.tool) {
                const inputStr = f.toolInput
                  ? JSON.stringify(f.toolInput)
                  : "(no input)";
                lines.push(`    tool: ${f.tool}(${inputStr})`);
              }
              lines.push(`    signal: ${f.signal} (${f.severity})`);
              if (f.evidence) lines.push(`    evidence: ${f.evidence}`);
              return lines.join("\n");
            })
            .join("\n")}\n`
        : "";

    return `${PLANNER_PROMPT_TEMPLATE}
${this.toolsBlock}
Goal:
${goal}
${context ? `\nContext:\n${context}\n` : ""}${designSpecBlock}${historyBlock}${failuresBlock}${visualFeedbackBlock}`;
  }

  /**
   * Calls the injected LLM client. Prefills with `{` to force JSON output when
   * no images are attached (prefill is ignored in multimodal mode).
   */
  private async callLLM(prompt: string, images?: LlmImage[]): Promise<string> {
    const res = await this.llm.complete({
      prompt,
      model: this.config.model,
      temperature: this.config.temperature,
      prefill: "{",
      label: "planner",
      images,
    });
    return res.text;
  }

  /**
   * Strict parsing layer (important for safety + determinism)
   */
  private parsePlan(raw: string, goal: string): Plan {
    let json: { goal?: string; steps?: unknown };
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error("Planner output is not valid JSON");
    }

    if (!Array.isArray(json.steps)) {
      throw new Error("Invalid plan: missing steps array");
    }

    const steps: PlanStep[] = json.steps.map((raw: unknown, idx: number) => {
      const s = raw as Partial<PlanStep>;
      return {
        id: s.id ?? `step_${idx + 1}`,
        type: s.type as PlanStep["type"],
        description: s.description as string,
        tool: s.tool,
        input: s.input,
        dependsOn: s.dependsOn ?? [],
      };
    });

    return {
      goal: json.goal ?? goal,
      steps,
    };
  }

  /**
   * Hard validation before execution
   */
  private validatePlan(plan: Plan) {
    if (plan.steps.length === 0) {
      throw new Error("Plan must contain at least one step");
    }

    for (const step of plan.steps) {
      if (!step.description) {
        throw new Error(`Step ${step.id} missing description`);
      }

      if (!step.type) {
        throw new Error(`Step ${step.id} missing type`);
      }
    }
  }
}