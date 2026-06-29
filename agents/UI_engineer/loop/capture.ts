import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";

import type {
  InteractionSpec,
  ScreenAction,
  ScreenAssertion,
  SectionCapture,
  Viewport,
} from "./screens";

export interface AssertionResult {
  assertion: ScreenAssertion;
  passed: boolean;
  detail?: string;
}

export interface SectionResult {
  screen: number;
  section: number;
  url: string;
  imageName: string;
  screenshotPath: string;
  assertions: AssertionResult[];
  visualScore?: number;
  visualDifferences?: string[];
}

export interface InteractionResult {
  name: string;
  screen: number;
  url: string;
  assertions: AssertionResult[];
}

/**
 * One Chromium instance reused across all captures and interactions in a verifier pass.
 */
export class Capture {
  private browser?: Browser;
  private readonly baseUrl: string;
  private readonly screenshotDir: string;

  constructor(input: { baseUrl: string; screenshotDir: string }) {
    this.baseUrl = input.baseUrl;
    this.screenshotDir = input.screenshotDir;
  }

  async start(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
  }

  async stop(): Promise<void> {
    if (!this.browser) return;
    await this.browser.close();
    this.browser = undefined;
  }

  /**
   * Navigate, scroll to section position, screenshot, run assertions.
   */
  async captureSection(
    spec: SectionCapture,
    iteration: number,
  ): Promise<SectionResult> {
    if (!this.browser) throw new Error("Capture not started — call start() first");

    const { page, context } = await this.newPage(spec.viewport);
    try {
      const target = new URL(spec.url, this.baseUrl).toString();
      await page.goto(target, { waitUntil: "networkidle", timeout: 30_000 });

      if (spec.scrollY > 0) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior }), spec.scrollY);
        // Give layout / lazy-loaded content a moment to settle.
        await page.waitForTimeout(300);
      }

      const assertions = await this.runAssertions(page, spec.assertions ?? []);

      const screenshotPath = join(
        this.screenshotDir,
        `iter_${iteration}`,
        spec.imageName,
      );
      mkdirSync(dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: false });

      return {
        screen: spec.screen,
        section: spec.section,
        url: target,
        imageName: spec.imageName,
        screenshotPath,
        assertions,
      };
    } finally {
      await context.close();
    }
  }

  /**
   * Navigate fresh, run scripted actions, run assertions. No screenshot.
   */
  async runInteraction(spec: InteractionSpec): Promise<InteractionResult> {
    if (!this.browser) throw new Error("Capture not started — call start() first");

    const { page, context } = await this.newPage(spec.viewport);
    try {
      const target = new URL(spec.url, this.baseUrl).toString();
      await page.goto(target, { waitUntil: "networkidle", timeout: 30_000 });

      for (const action of spec.actions) {
        await this.runAction(page, action);
      }

      const assertions = await this.runAssertions(page, spec.assertions);

      return {
        name: spec.name,
        screen: spec.screen,
        url: target,
        assertions,
      };
    } finally {
      await context.close();
    }
  }

  private async newPage(viewport: Viewport) {
    if (!this.browser) throw new Error("Capture not started");
    const context = await this.browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    return { page, context };
  }

  private async runAction(page: Page, action: ScreenAction): Promise<void> {
    switch (action.type) {
      case "click":
        await page.click(action.selector, { timeout: 10_000 });
        break;
      case "hover":
        await page.hover(action.selector, { timeout: 10_000 });
        break;
      case "scroll_to":
        if (action.selector) {
          await page.locator(action.selector).scrollIntoViewIfNeeded({ timeout: 10_000 });
        } else if (typeof action.y === "number") {
          await page.evaluate((y) => window.scrollTo(0, y), action.y);
        }
        break;
      case "wait_for":
        await page.waitForSelector(action.selector, {
          timeout: action.timeoutMs ?? 10_000,
        });
        break;
    }
  }

  private async runAssertions(
    page: Page,
    assertions: ScreenAssertion[],
  ): Promise<AssertionResult[]> {
    const out: AssertionResult[] = [];
    for (const a of assertions) {
      try {
        switch (a.type) {
          case "element_exists": {
            const count = await page.locator(a.selector).count();
            out.push({
              assertion: a,
              passed: count > 0,
              detail: count > 0 ? undefined : `no element matched: ${a.selector}`,
            });
            break;
          }
          case "text_visible": {
            const el = page.locator(a.selector).filter({ hasText: a.text });
            const visible = await el.first().isVisible().catch(() => false);
            out.push({
              assertion: a,
              passed: visible,
              detail: visible
                ? undefined
                : `selector ${a.selector} not visible with text "${a.text}"`,
            });
            break;
          }
          case "count_at_least": {
            const count = await page.locator(a.selector).count();
            out.push({
              assertion: a,
              passed: count >= a.min,
              detail:
                count >= a.min
                  ? undefined
                  : `expected ≥${a.min} matches of ${a.selector}, found ${count}`,
            });
            break;
          }
          case "attribute_equals": {
            const val = await page.locator(a.selector).first().getAttribute(a.attribute);
            out.push({
              assertion: a,
              passed: val === a.value,
              detail:
                val === a.value
                  ? undefined
                  : `${a.selector}[${a.attribute}] = ${val ?? "(null)"}, expected ${a.value}`,
            });
            break;
          }
        }
      } catch (err) {
        out.push({
          assertion: a,
          passed: false,
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    }
    return out;
  }
}
