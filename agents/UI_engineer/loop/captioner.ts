import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const DOCS_DIR = join(__dirname, "docs");
const SPEC_FILE = join(DOCS_DIR, "design-specs.md");

const IMG_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const MEDIA_TYPES: Record<string, "image/png" | "image/jpeg" | "image/webp" | "image/gif"> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const SYSTEM_PROMPT = `You produce DESIGN SPECIFICATIONS for an autonomous coding agent that
will build a website from reference screenshots. Be concrete, exhaustive, and structured.
The agent cannot see the images — only your text. Output Markdown only.`;

const USER_PROMPT = `These screenshots are the visual design specification for a personal portfolio
website. Produce a single Markdown document titled "# Design Specification" that an LLM coding
agent can use as the source of truth. For EACH screenshot:

1. Identify which page/section it shows (hero, projects grid, project modal, resume, blogs, footer, etc.)
2. Describe the layout exhaustively (grid columns, container widths, spacing scale, breakpoints implied)
3. Describe the visual style — color palette (hex if estimable), typography (font families, weights, sizes
   relative to each other), border radius, shadows, hover states implied, animations implied
4. Describe each component visible (cards, buttons, modals, nav, etc.) with the props/states a developer
   would need
5. Note interactions implied by the design (modal triggers, hover effects, focus states)

Then close with:
- A "## Component Inventory" section listing every reusable component the agent should build
- A "## Tailwind Tokens" section with explicit hex codes and class names to use
- A "## Cross-cutting Rules" section (consistency expectations across sections)

Be specific enough that the agent can build the site WITHOUT seeing the images. Avoid vague phrases
like "modern" or "clean" — quantify everything.`;

export interface CaptionerOptions {
  model?: string;
  force?: boolean;
}

export class Captioner {
  private model: string;

  constructor(options: CaptionerOptions = {}) {
    this.model = options.model ?? "claude-sonnet-4-6";
  }

  /**
   * Generates loop/docs/design-spec.md from every image in loop/docs/.
   * No-ops if the spec already exists and force is not set.
   */
  async generate(force = false): Promise<{ path: string; skipped: boolean }> {
    if (!force && existsSync(SPEC_FILE)) {
      return { path: SPEC_FILE, skipped: true };
    }

    const images = this.collectImages();
    if (images.length === 0) {
      throw new Error(`no images found in ${DOCS_DIR}`);
    }

    const content = await this.runVisionQuery(images);
    writeFileSync(SPEC_FILE, content, "utf8");
    return { path: SPEC_FILE, skipped: false };
  }

  private collectImages(): Array<{ name: string; data: string; mediaType: string }> {
    const files = readdirSync(DOCS_DIR)
      .filter((f) => IMG_EXTS.has(extname(f).toLowerCase()))
      .sort();

    return files.map((f) => {
      const ext = extname(f).toLowerCase();
      return {
        name: f,
        data: readFileSync(join(DOCS_DIR, f)).toString("base64"),
        mediaType: MEDIA_TYPES[ext],
      };
    });
  }

  private async runVisionQuery(
    images: Array<{ name: string; data: string; mediaType: string }>,
  ): Promise<string> {
    // ESM-only — dynamic import keeps this file CJS-compatible.
    const { query } = await import("@anthropic-ai/claude-agent-sdk");

    // Build a single user message: prompt + each image, with a name label preceding each.
    const content: Array<unknown> = [{ type: "text", text: USER_PROMPT }];
    for (const img of images) {
      content.push({ type: "text", text: `\n\nImage: ${img.name}` });
      content.push({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.data },
      });
    }

    async function* messageStream() {
      yield {
        type: "user" as const,
        message: { role: "user" as const, content: content as never },
        parent_tool_use_id: null,
      };
    }

    const q = query({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prompt: messageStream() as any,
      options: {
        model: this.model,
        tools: [],
        systemPrompt: SYSTEM_PROMPT,
      },
    });

    for await (const msg of q) {
      if (msg.type === "result") {
        if (msg.subtype === "success") return msg.result;
        throw new Error(`captioner failed: ${msg.subtype}`);
      }
    }
    throw new Error("captioner closed without a result message");
  }
}

export function readDesignSpec(): string | undefined {
  if (!existsSync(SPEC_FILE)) return undefined;
  return readFileSync(SPEC_FILE, "utf8");
}

export interface DesignImage {
  name: string;
  /** Base64-encoded image bytes — ready for an Anthropic image content block. */
  data: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
}

export function loadDesignImages(): DesignImage[] {
  if (!existsSync(DOCS_DIR)) return [];
  const files = readdirSync(DOCS_DIR)
    .filter((f) => IMG_EXTS.has(extname(f).toLowerCase()))
    .sort();
  return files.map((f) => {
    const ext = extname(f).toLowerCase();
    return {
      name: f,
      data: readFileSync(join(DOCS_DIR, f)).toString("base64"),
      mediaType: MEDIA_TYPES[ext],
    };
  });
}
