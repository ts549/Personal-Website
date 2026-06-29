import { existsSync } from "node:fs";
import { join } from "node:path";

import { Capture, type InteractionResult, type SectionResult } from "./capture";
import type { Judge } from "./judge";
import type { InteractionSpec, SectionCapture } from "./screens";

/**
 * Per-failure feedback fed into the next planner iteration.
 * One entry per failing section or interaction.
 */
export interface VisualFeedback {
  /** "screen_1_section_2.png" for sections; "interaction: project_modal_opens" for interactions. */
  context: string;
  visualScore?: number;
  visualDifferences: string[];
  failedAssertions: string[];
}

export interface VerificationResult {
  iteration: number;
  status: "success" | "failed";
  /** Mean visual score across judged sections. 0 if none judged. */
  score: number;
  /** Empty — retained for the Loop's existing logging shape. */
  failedSteps: string[];
  summary: string;
  sectionResults: SectionResult[];
  interactionResults: InteractionResult[];
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

  async verify(input: {
    iteration: number;
    sections: SectionCapture[];
    interactions: InteractionSpec[];
    baseUrl: string;
  }): Promise<VerificationResult> {
    const capture = new Capture({
      baseUrl: input.baseUrl,
      screenshotDir: this.screenshotDir,
    });
    await capture.start();

    const sectionResults: SectionResult[] = [];
    const interactionResults: InteractionResult[] = [];

    try {
      for (const sec of input.sections) {
        console.log(
          `    [verifier] section ${sec.imageName} — ${sec.url} @ scrollY=${sec.scrollY}`,
        );
        const r = await capture.captureSection(sec, input.iteration);

        const referencePath = join(this.referenceDir, sec.imageName);
        if (existsSync(referencePath)) {
          try {
            const verdict = await this.judge.compare({
              referencePath,
              currentPath: r.screenshotPath,
              screenName: sec.imageName,
            });
            r.visualScore = verdict.score;
            r.visualDifferences = verdict.differences;
          } catch (err) {
            console.log(
              `    [verifier] judge failed for ${sec.imageName}: ${
                err instanceof Error ? err.message : String(err)
              }`,
            );
            r.visualDifferences = ["visual judge call failed"];
          }
        } else {
          console.log(
            `    [verifier] no reference at ${referencePath}; skipping visual judge`,
          );
        }

        sectionResults.push(r);
      }

      for (const ix of input.interactions) {
        console.log(`    [verifier] interaction ${ix.name} on ${ix.url}`);
        try {
          interactionResults.push(await capture.runInteraction(ix));
        } catch (err) {
          interactionResults.push({
            name: ix.name,
            screen: ix.screen,
            url: ix.url,
            assertions: [
              {
                assertion: { type: "element_exists", selector: "<interaction setup>" },
                passed: false,
                detail: err instanceof Error ? err.message : String(err),
              },
            ],
          });
        }
      }
    } finally {
      await capture.stop();
    }

    return this.aggregate(input.iteration, sectionResults, interactionResults);
  }

  private aggregate(
    iteration: number,
    sectionResults: SectionResult[],
    interactionResults: InteractionResult[],
  ): VerificationResult {
    const visualFeedback: VisualFeedback[] = [];
    let scoreSum = 0;
    let scoreCount = 0;
    let allOk = true;

    for (const r of sectionResults) {
      const failedAssertions = r.assertions
        .filter((a) => !a.passed)
        .map((a) => a.detail ?? JSON.stringify(a.assertion));

      const visualLow =
        r.visualScore !== undefined && r.visualScore < this.visualThreshold;

      if (failedAssertions.length > 0 || visualLow) allOk = false;

      if (r.visualScore !== undefined) {
        scoreSum += r.visualScore;
        scoreCount++;
      }

      if (failedAssertions.length > 0 || visualLow) {
        visualFeedback.push({
          context: r.imageName,
          visualScore: r.visualScore,
          visualDifferences: r.visualDifferences ?? [],
          failedAssertions,
        });
      }
    }

    for (const r of interactionResults) {
      const failedAssertions = r.assertions
        .filter((a) => !a.passed)
        .map((a) => a.detail ?? JSON.stringify(a.assertion));

      if (failedAssertions.length > 0) {
        allOk = false;
        visualFeedback.push({
          context: `interaction: ${r.name}`,
          visualDifferences: [],
          failedAssertions,
        });
      }
    }

    const meanScore = scoreCount > 0 ? scoreSum / scoreCount : 0;
    const status: VerificationResult["status"] = allOk ? "success" : "failed";

    const summary: string[] = [
      `Verification: ${status}`,
      `Mean visual score: ${meanScore.toFixed(1)} (threshold ${this.visualThreshold})`,
      `Sections: ${sectionResults.length}, interactions: ${interactionResults.length}`,
    ];
    for (const r of sectionResults) {
      const ax = r.assertions.length;
      const axFail = r.assertions.filter((a) => !a.passed).length;
      const v = r.visualScore !== undefined ? r.visualScore.toFixed(0) : "n/a";
      summary.push(`  - ${r.imageName}: visual=${v}, assertions ${ax - axFail}/${ax} pass`);
    }
    for (const r of interactionResults) {
      const ax = r.assertions.length;
      const axFail = r.assertions.filter((a) => !a.passed).length;
      summary.push(`  - interaction ${r.name}: assertions ${ax - axFail}/${ax} pass`);
    }

    return {
      iteration,
      status,
      score: meanScore / 100,
      failedSteps: [],
      summary: summary.join("\n"),
      sectionResults,
      interactionResults,
      visualFeedback,
    };
  }
}
