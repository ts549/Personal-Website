import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const SCREENS_YML_PATH = join(__dirname, "config", "screens.yml");

export interface Viewport {
  width: number;
  height: number;
}

export type ScreenAction =
  | { type: "click"; selector: string }
  | { type: "hover"; selector: string }
  | { type: "scroll_to"; selector?: string; y?: number }
  | { type: "wait_for"; selector: string; timeoutMs?: number };

export type ScreenAssertion =
  | { type: "element_exists"; selector: string }
  | { type: "text_visible"; selector: string; text: string }
  | { type: "count_at_least"; selector: string; min: number }
  | { type: "attribute_equals"; selector: string; attribute: string; value: string };

/**
 * Flattened internal shape — one entry per (URL × view) tuple.
 * The YAML is grouped by URL for editing ergonomics; the loader flattens.
 */
export interface ScreenSpec {
  /** Matches the reference image filename in loop/docs/. */
  name: string;
  url: string;
  viewport: Viewport;
  actions?: ScreenAction[];
  assertions?: ScreenAssertion[];
}

export interface ScreensConfig {
  screens: ScreenSpec[];
}

/** The YAML schema as written by the user — URL-grouped views. */
interface YamlView {
  image: string;
  viewport?: Viewport;
  actions?: ScreenAction[];
  assertions?: ScreenAssertion[];
}

interface YamlScreen {
  url: string;
  viewport: Viewport;
  views: YamlView[];
}

interface YamlRoot {
  screens: YamlScreen[];
}

export function loadScreensConfig(): ScreensConfig {
  const raw = parseYaml(readFileSync(SCREENS_YML_PATH, "utf8")) as YamlRoot;

  const flat: ScreenSpec[] = [];
  for (const screen of raw.screens ?? []) {
    for (const view of screen.views ?? []) {
      flat.push({
        name: view.image,
        url: screen.url,
        viewport: view.viewport ?? screen.viewport,
        actions: view.actions,
        assertions: view.assertions,
      });
    }
  }
  return { screens: flat };
}

export interface AssertionResult {
  assertion: ScreenAssertion;
  passed: boolean;
  detail?: string;
}

export interface ScreenResult {
  name: string;
  url: string;
  screenshotPath: string;
  assertions: AssertionResult[];
  /** Set by the visual judge after comparison against the reference image. */
  visualScore?: number;
  visualDifferences?: string[];
}
