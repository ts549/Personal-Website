import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import "dotenv/config";

import { Captioner, readDesignSpec } from "./loop/captioner";
import { DevServer } from "./loop/devserver";
import { Executor } from "./loop/executor";
import { loadGoalConfig, renderGoal } from "./loop/goal";
import { Judge } from "./loop/judge";
import { ClaudeAgentClient } from "./loop/llm";
import type { LlmClient } from "./loop/llm";
import { Planner } from "./loop/planner";
import { loadScreensConfig } from "./loop/screens";
import { loadSession, newSession, writeSession } from "./loop/session";
import { Summarizer } from "./loop/summarizer";
import { Registry, loadToolsConfig } from "./loop/tools/registry";
import type {
  ExecutionResult,
  FailureRecord,
  IterationRecord,
  SessionState,
  SummaryRecord,
} from "./loop/types";
import type { VisualFeedback } from "./loop/verifier";
import { Verifier } from "./loop/verifier";

const SANDBOX_ROOT = join(__dirname, "..", "..", "app");
const RUNTIME_DIR = join(__dirname, "loop", "runtime");
const SCREENSHOT_DIR = join(RUNTIME_DIR, "screenshots");
const REFERENCE_DIR = join(__dirname, "loop", "docs");
const FAILURES_FILE = join(RUNTIME_DIR, "failures.jsonl");
const STATE_FILE = join(RUNTIME_DIR, "state.yml");

const SUMMARIZE_AFTER = 5;

export interface LoopConfig {
  goal: string;
  context?: string;
  maxIterations: number;
  /** If true, resume the existing session from state.yml; otherwise start fresh. */
  resume?: boolean;
}

/**
 * Loop driver — the single writer of runtime/state.yml and runtime/failures.jsonl.
 *
 * Session model:
 *   - state.yml grows within a session (rolling window of full-detail iterations
 *     + a Summarizer-condensed summary of older ones).
 *   - failures.jsonl persists across sessions; rows tagged with session_id.
 *   - New Loop.run() = new session unless config.resume is true.
 */
export class Loop {
  private llm: LlmClient;
  private planner: Planner;
  private summarizer: Summarizer;
  private registry: Registry;
  private executor: Executor;
  private verifier: Verifier;
  private devServer: DevServer;
  private captioner: Captioner;

  constructor(llm?: LlmClient) {
    this.llm = llm ?? new ClaudeAgentClient();
    const tools = loadToolsConfig();
    this.planner = new Planner(this.llm, { tools });
    this.summarizer = new Summarizer(this.llm);
    this.captioner = new Captioner();
    this.registry = new Registry({ sandboxRoot: SANDBOX_ROOT });
    this.executor = new Executor({ toolRegistry: this.registry });
    this.verifier = new Verifier({
      judge: new Judge(this.llm),
      config: {
        referenceDir: REFERENCE_DIR,
        screenshotDir: SCREENSHOT_DIR,
      },
    });
    this.devServer = new DevServer(SANDBOX_ROOT);
  }

  async run(config: LoopConfig): Promise<void> {
    const session = this.initSession(config);
    console.log(
      `session ${session.session_id} (${config.resume ? "resumed" : "new"})`,
    );

    const screensConfig = loadScreensConfig();
    console.log(
      `screens: ${screensConfig.sections.length} section(s), ${screensConfig.interactions.length} interaction(s) configured`,
    );
    const sectionsWithRef = screensConfig.sections.filter((s) =>
      existsSync(join(REFERENCE_DIR, s.imageName)),
    );
    const sectionsMissingRef = screensConfig.sections.filter(
      (s) => !existsSync(join(REFERENCE_DIR, s.imageName)),
    );
    if (sectionsMissingRef.length > 0) {
      console.log(
        `  sections without reference image (visual judge skipped): ${sectionsMissingRef.map((s) => s.imageName).join(", ")}`,
      );
    }

    // Auto-run the captioner on first start if design-specs.md is missing.
    if (!readDesignSpec()) {
      console.log(`design-specs.md missing — running captioner once`);
      const { path, skipped } = await this.captioner.generate(false);
      console.log(skipped ? `  already present at ${path}` : `  wrote ${path}`);
    }

    await this.devServer.start();

    let visualFeedback: VisualFeedback[] = [];

    try {
      const startIteration = session.iterations.reduce(
        (max, e) =>
          e.type === "iteration"
            ? Math.max(max, e.iteration)
            : Math.max(max, e.covers.to),
        0,
      );

      let iteration = startIteration;
      while (iteration - startIteration < config.maxIterations) {
        iteration++;
        this.registry.beginIteration();

        const recentFailures = this.readFailuresFromIteration(
          session.session_id,
          iteration - 1,
        );

        const iterT0 = Date.now();
        console.log(`\n=== iteration ${iteration} ===`);
        console.log(`  recent failures from prior iter: ${recentFailures.length}`);
        console.log(`  history depth: ${session.iterations.length} iter(s) in window`);
        console.log(`  visual feedback from prior iter: ${visualFeedback.length} screen(s)`);

        console.log(`  → planning`);
        const plan = await this.planner.createPlan({
          goal: config.goal,
          context: config.context,
          recentFailures,
          iterationHistory: session.iterations,
          designSpec: readDesignSpec(),
          visualFeedback,
        });
        console.log(`  ← plan: ${plan.steps.length} steps`);
        for (const s of plan.steps) {
          console.log(
            `      ${s.id} [${s.type}${s.tool ? `:${s.tool}` : ""}] ${s.description}`,
          );
        }

        console.log(`  → executing`);
        const { results } = await this.executor.run(plan);
        for (const r of results) {
          console.log(
            `      ${r.stepId}: ${r.status}${r.error ? ` — ${r.error}` : ""}`,
          );
        }

        console.log(`  → verifying (sections + interactions + visual judge)`);
        const verification = await this.verifier.verify({
          iteration,
          sections: screensConfig.sections,
          interactions: screensConfig.interactions,
          baseUrl: this.devServer.baseUrl,
        });
        visualFeedback = verification.visualFeedback;

        const iterDt = ((Date.now() - iterT0) / 1000).toFixed(1);
        console.log(
          `  ← ${verification.status} (mean visual score ${(verification.score * 100).toFixed(0)}, iteration took ${iterDt}s)`,
        );
        console.log(verification.summary.split("\n").map((l) => `    ${l}`).join("\n"));

        const newFailures = this.collectFailures(
          session.session_id,
          iteration,
          plan,
          results,
        );
        if (newFailures.length > 0) this.appendFailures(newFailures);

        const record: IterationRecord = {
          type: "iteration",
          iteration,
          timestamp: new Date().toISOString(),
          plan: {
            goal: plan.goal,
            steps: plan.steps.map((s) => ({
              id: s.id,
              type: s.type,
              tool: s.tool,
              description: s.description,
            })),
          },
          results: results.map((r) => ({
            stepId: r.stepId,
            status: r.status,
            error: r.error,
          })),
          verification: {
            status: verification.status,
            score: verification.score,
            failedSteps: verification.failedSteps,
            summary: verification.summary,
          },
        };
        session.iterations.push(record);

        await this.maybeCondense(session, config.goal);

        if (verification.status === "success") {
          session.status = "succeeded";
          writeSession(STATE_FILE, session);
          return;
        }

        writeSession(STATE_FILE, session);
      }

      session.status = "halted";
      writeSession(STATE_FILE, session);
    } finally {
      await this.devServer.stop();
    }
  }

  /** Best-effort cleanup of the dev server. Called from signal handlers and on normal exit. */
  async shutdown(): Promise<void> {
    await this.devServer.stop();
  }

  private initSession(config: LoopConfig): SessionState {
    if (config.resume) {
      const existing = loadSession(STATE_FILE);
      if (existing) return existing;
    }
    const fresh = newSession(config.goal);
    writeSession(STATE_FILE, fresh);
    return fresh;
  }

  /**
   * Bulk-folds the oldest contiguous run of IterationRecords into a single
   * frozen SummaryRecord, in place. Triggers when the detail run exceeds
   * SUMMARIZE_AFTER. SummaryRecords are never re-summarized.
   *
   * iterations is always laid out as [summary*, iteration*] — summaries
   * precede live entries — so we find the first IterationRecord and fold
   * the next SUMMARIZE_AFTER of them.
   */
  private async maybeCondense(session: SessionState, goal: string): Promise<void> {
    const firstIterIdx = session.iterations.findIndex(
      (e) => e.type === "iteration",
    );
    if (firstIterIdx === -1) return;

    const detailCount = session.iterations.length - firstIterIdx;
    if (detailCount <= SUMMARIZE_AFTER) return;

    const toFold = session.iterations.slice(
      firstIterIdx,
      firstIterIdx + SUMMARIZE_AFTER,
    ) as IterationRecord[];
    const from = toFold[0].iteration;
    const to = toFold[toFold.length - 1].iteration;

    console.log(`  → condensing iterations ${from}-${to} into a frozen summary`);
    const text = await this.summarizer.condense({
      iterationsToFold: toFold,
      goal,
    });

    const summary: SummaryRecord = {
      type: "summary",
      covers: { from, to },
      timestamp: new Date().toISOString(),
      text,
    };
    session.iterations.splice(firstIterIdx, SUMMARIZE_AFTER, summary);
  }

  /**
   * Reads failures.jsonl filtered to (session_id, iteration). Failures from
   * other sessions stay on disk for cross-session debugging.
   */
  private readFailuresFromIteration(
    sessionId: string,
    iter: number,
  ): FailureRecord[] {
    if (iter < 1 || !existsSync(FAILURES_FILE)) return [];
    const raw = readFileSync(FAILURES_FILE, "utf8");
    const out: FailureRecord[] = [];
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      const rec = JSON.parse(line) as FailureRecord;
      if (rec.session_id === sessionId && rec.iteration === iter) out.push(rec);
    }
    return out;
  }

  private collectFailures(
    sessionId: string,
    iteration: number,
    plan: { steps: { id: string; description: string; tool?: string; input?: Record<string, unknown> }[] },
    results: ExecutionResult[],
  ): FailureRecord[] {
    const timestamp = new Date().toISOString();
    const stepById = new Map(plan.steps.map((s) => [s.id, s]));
    return results
      .filter((r) => r.status === "failed")
      .map((r) => {
        const step = stepById.get(r.stepId);
        return {
          session_id: sessionId,
          iteration,
          timestamp,
          stepId: r.stepId,
          stepDescription: step?.description,
          tool: step?.tool,
          toolInput: step?.input,
          signal: "execution",
          severity: "error" as const,
          message: r.error ?? "step failed",
        };
      });
  }

  private appendFailures(records: FailureRecord[]): void {
    const lines = `${records.map((r) => JSON.stringify(r)).join("\n")}\n`;
    appendFileSync(FAILURES_FILE, lines, "utf8");
  }
}

async function main() {
  const cmd = process.argv[2];

  if (cmd === "caption") {
    const force = process.argv.includes("--force");
    const captioner = new Captioner();
    const { path, skipped } = await captioner.generate(force);
    console.log(skipped ? `design-spec already exists at ${path} (pass --force to regenerate)` : `wrote ${path}`);
    return;
  }

  const loop = new Loop();

  // Trap Ctrl+C / SIGTERM so the dev server (and its grandchild npm/next
  // processes) get killed instead of orphaned. Idempotent via `once`.
  let cleaningUp = false;
  const onSignal = async (signal: string) => {
    if (cleaningUp) return;
    cleaningUp = true;
    console.log(`\n[loop] ${signal} received — stopping dev server`);
    try {
      await loop.shutdown();
    } catch {
      // best effort
    }
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.once("SIGINT", () => onSignal("SIGINT"));
  process.once("SIGTERM", () => onSignal("SIGTERM"));

  const { goal, context } = renderGoal(loadGoalConfig());
  await loop.run({ goal, context, maxIterations: 10 });
  console.log("done");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("loop failed:", err);
    process.exit(1);
  });
}
