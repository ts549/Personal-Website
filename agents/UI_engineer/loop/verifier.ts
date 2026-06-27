import { existsSync } from "node:fs";
import { join } from "node:path";

import { Capture } from "./capture";
import type { Judge } from "./judge";
import type { ScreenResult, ScreenSpec } from "./screens";

/**
 * Per-screen feedback fed into the next planner iteration when verification fails.
 * Lists exactly what differs visually and which functional checks broke.
 */
export interface VisualFeedback {
  screen: string;
  visualScore?: number;
  visualDifferences: string[];
  failedAssertions: string[];
}

/**
 * Verifier verdict. Success requires:
 *   - every visual score >= visualThreshold (default 90)
 *   - every assertion across every screen passes
 */
export interface VerificationResult {
  iteration: number;
  status: "success" | "failed";
  /** Mean visual score across all screens; kept for legacy logging. */
  score: number;
  /** Empty — retained for the Loop's existing logging shape. */
  failedSteps: string[];
  summary: string;
  screenResults: ScreenResult[];
  visualFeedback: VisualFeedback[];
}

export interface VerifierConfig {
  visualThreshold?: number;
  referenceDir: string;
  screenshotDir: string;
}

export class Verifier {
  private readonly visualThreshold: number;
  private readonly referenceDir: string;
  private readonly screenshotDir: string;
  private readonly judge: Judge;

  constructor(input: { judge: Judge; config: VerifierConfig }) {
    this.judge = input.judge;
    this.visualThreshold = input.config.visualThreshold ?? 90;
    this.referenceDir = input.config.referenceDir;
    this.screenshotDir = input.config.screenshotDir;
  }

  /**
   * Captures every screen, runs assertions, judges visuals, and returns
   * an aggregated verdict + per-screen feedback for the next planner call.
   * Caller owns the dev server lifecycle.
   */
  async verify(input: {
    iteration: number;
    screens: ScreenSpec[];
    baseUrl: string;
  }): Promise<VerificationResult> {
    const capture = new Capture({
      baseUrl: input.baseUrl,
      screenshotDir: this.screenshotDir,
    });
    await capture.start();

    const screenResults: ScreenResult[] = [];
    try {
      for (const spec of input.screens) {
        console.log(`    [verifier] capturing ${spec.name} (${spec.url})`);
        const r = await capture.captureScreen(spec, input.iteration);

        const referencePath = join(this.referenceDir, spec.name);
        if (existsSync(referencePath)) {
          try {
            const verdict = await this.judge.compare({
              referencePath,
              currentPath: r.screenshotPath,
              screenName: spec.name,
            });
            r.visualScore = verdict.score;
            r.visualDifferences = verdict.differences;
          } catch (err) {
            console.log(
              `    [verifier] judge failed for ${spec.name}: ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
            r.visualScore = undefined;
            r.visualDifferences = [
              "visual judge call failed — could not compute similarity",
            ];
          }
        } else {
          console.log(
            `    [verifier] no reference image at ${referencePath}; skipping visual judge for ${spec.name}`,
          );
        }

        screenResults.push(r);
      }
    } finally {
      await capture.stop();
    }

    return this.aggregate(input.iteration, screenResults);
  }

  private aggregate(
    iteration: number,
    screenResults: ScreenResult[],
  ): VerificationResult {
    const visualFeedback: VisualFeedback[] = [];
    let scoreSum = 0;
    let scoreCount = 0;
    let visualPass = true;
    let assertionPass = true;

    for (const r of screenResults) {
      const failedAssertions = r.assertions
        .filter((a) => !a.passed)
        .map((a) => a.detail ?? JSON.stringify(a.assertion));

      const visualLow =
        r.visualScore !== undefined && r.visualScore < this.visualThreshold;

      if (failedAssertions.length > 0) assertionPass = false;
      if (visualLow) visualPass = false;
      // r.visualScore === undefined → no reference available; treated as
      // not-applicable, neither pass nor fail. Assertions still gate success.

      if (r.visualScore !== undefined) {
        scoreSum += r.visualScore;
        scoreCount++;
      }

      if (failedAssertions.length > 0 || visualLow) {
        visualFeedback.push({
          screen: r.name,
          visualScore: r.visualScore,
          visualDifferences: r.visualDifferences ?? [],
          failedAssertions,
        });
      }
    }

    const meanScore = scoreCount > 0 ? scoreSum / scoreCount : 0;
    const status: VerificationResult["status"] =
      visualPass && assertionPass ? "success" : "failed";

    const summaryLines: string[] = [
      `Verification: ${status}`,
      `Mean visual score: ${meanScore.toFixed(1)} (threshold ${this.visualThreshold})`,
      `Screens captured: ${screenResults.length}`,
    ];
    for (const r of screenResults) {
      const ax = r.assertions.length;
      const axFail = r.assertions.filter((a) => !a.passed).length;
      const v = r.visualScore !== undefined ? r.visualScore.toFixed(0) : "n/a";
      summaryLines.push(
        `  - ${r.name}: visual=${v}, assertions ${ax - axFail}/${ax} pass`,
      );
    }

    return {
      iteration,
      status,
      score: meanScore / 100,
      failedSteps: [],
      summary: summaryLines.join("\n"),
      screenResults,
      visualFeedback,
    };
  }
}
