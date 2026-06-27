import type { LlmClient } from "./llm";
import type { IterationRecord } from "./types";

export interface SummarizerConfig {
  model?: string;
  temperature?: number;
}

/**
 * Condenses older iterations into a rolling session summary so state.yml
 * doesn't grow unbounded and the planner gets a useful long-horizon view.
 */
export class Summarizer {
  private llm: LlmClient;
  private model: string;
  private temperature: number;

  constructor(llm: LlmClient, config: SummarizerConfig = {}) {
    this.llm = llm;
    this.model = config.model ?? "claude-sonnet-4-6";
    this.temperature = config.temperature ?? 0.2;
  }

  async condense(input: {
    iterationsToFold: IterationRecord[];
    goal: string;
  }): Promise<string> {
    const prompt = this.buildPrompt(input.goal, input.iterationsToFold);
    const res = await this.llm.complete({
      prompt,
      model: this.model,
      temperature: this.temperature,
      label: "summarizer",
      systemPrompt:
        "You are a concise technical historian. Produce plain prose summaries — no JSON, no markdown headers, no preamble.",
    });
    return res.text.trim();
  }

  private buildPrompt(goal: string, iterations: IterationRecord[]): string {
    const iterBlocks = iterations.map((it) => {
      const steps = it.plan.steps
        .map((s) => `    - ${s.id} [${s.tool ?? s.type}] ${s.description}`)
        .join("\n");
      const results = it.results
        .map((r) => `    - ${r.stepId}: ${r.status}${r.error ? ` (${r.error})` : ""}`)
        .join("\n");
      return `Iteration ${it.iteration} (${it.verification.status}, score ${it.verification.score.toFixed(2)}):
  Plan:
${steps}
  Results:
${results}
  Verification: ${it.verification.summary.split("\n")[0]}`;
    }).join("\n\n");

    const from = iterations[0].iteration;
    const to = iterations[iterations.length - 1].iteration;
    return `You are producing a FROZEN, IMMUTABLE summary covering iterations ${from}-${to} of an
autonomous agent loop. This summary will never be edited — it stands alone as the historical
record of this range.

GOAL:
${goal}

ITERATIONS TO SUMMARIZE:

${iterBlocks}

Produce a self-contained summary that captures, for this iteration range only:
- approaches that were tried
- what succeeded and is now in place
- what failed and why (root cause, not just symptom)
- patterns or hypotheses future iterations should carry forward

Be concise. Under 200 words. Output ONLY the summary text — no preamble, no headers, no markdown fences.`;
  }
}
