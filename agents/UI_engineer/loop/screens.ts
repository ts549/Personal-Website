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
 * One scroll-position screenshot pass.
 * imageName follows the naming convention: screen_{screen}_section_{section}.png
 * scrollY is computed as (section - 1) * viewport.height.
 */
export interface SectionCapture {
  screen: number;
  section: number;
  url: string;
  viewport: Viewport;
  scrollY: number;
  imageName: string;
  assertions?: ScreenAssertion[];
}

/**
 * Stateful flow checked independently of section screenshots.
 * Navigates fresh, runs actions, then asserts. No screenshot is compared.
 */
export interface InteractionSpec {
  screen: number;
  url: string;
  viewport: Viewport;
  name: string;
  actions: ScreenAction[];
  assertions: ScreenAssertion[];
}

export interface ScreensConfig {
  defaultViewport: Viewport;
  sections: SectionCapture[];
  interactions: InteractionSpec[];
}

// ---- YAML shape (as authored) ----

interface YamlSectionEntry {
  section: number;
  viewport?: Viewport;
  assertions?: ScreenAssertion[];
}

interface YamlInteractionEntry {
  name: string;
  actions: ScreenAction[];
  assertions: ScreenAssertion[];
}

interface YamlScreenEntry {
  screen: number;
  url: string;
  viewport?: Viewport;
  sections?: YamlSectionEntry[];
  interactions?: YamlInteractionEntry[];
}

interface YamlRoot {
  viewport: Viewport;
  screens: YamlScreenEntry[];
}

export function loadScreensConfig(): ScreensConfig {
  const raw = parseYaml(readFileSync(SCREENS_YML_PATH, "utf8")) as YamlRoot;
  const defaultViewport = raw.viewport;

  const sections: SectionCapture[] = [];
  const interactions: InteractionSpec[] = [];

  for (const screen of raw.screens ?? []) {
    const screenViewport = screen.viewport ?? defaultViewport;

    for (const sec of screen.sections ?? []) {
      const viewport = sec.viewport ?? screenViewport;
      sections.push({
        screen: screen.screen,
        section: sec.section,
        url: screen.url,
        viewport,
        scrollY: (sec.section - 1) * viewport.height,
        imageName: `screen_${screen.screen}_section_${sec.section}.png`,
        assertions: sec.assertions,
      });
    }

    for (const ix of screen.interactions ?? []) {
      interactions.push({
        screen: screen.screen,
        url: screen.url,
        viewport: screenViewport,
        name: ix.name,
        actions: ix.actions,
        assertions: ix.assertions,
      });
    }
  }

  return { defaultViewport, sections, interactions };
}
