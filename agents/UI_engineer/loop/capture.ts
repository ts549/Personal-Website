import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";

import type {
  AssertionResult,
  ScreenAction,
  ScreenAssertion,
  ScreenResult,
  ScreenSpec,
} from "./screens";

/**
 * Owns a single Chromium instance reused across all captures within a verifier run.
 * Open at start of a verification pass, close at the end.
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

  async captureScreen(spec: ScreenSpec, iteration: number): Promise<ScreenResult> {
    if (!this.browser) {
      throw new Error("Capture not started — call start() first");
    }

    const context = await this.browser.newContext({
      viewport: { width: spec.viewport.width, height: spec.viewport.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    try {
      const targetUrl = new URL(spec.url, this.baseUrl).toString();
      await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30_000 });

      for (const action of spec.actions ?? []) {
        await this.runAction(page, action);
      }

      const assertions = await this.runAssertions(page, spec.assertions ?? []);

      const screenshotPath = join(
        this.screenshotDir,
        `iter_${iteration}`,
        spec.name,
      );
      mkdirSync(dirname(screenshotPath), { recursive: true });
      await page.screenshot({ path: screenshotPath, fullPage: false });

      return {
        name: spec.name,
        url: targetUrl,
        screenshotPath,
        assertions,
      };
    } finally {
      await context.close();
    }
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
            const val = await page
              .locator(a.selector)
              .first()
              .getAttribute(a.attribute);
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
