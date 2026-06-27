import { readFileSync } from "node:fs";
import { extname } from "node:path";

import type { LlmClient, LlmImage } from "./llm";

const MEDIA_TYPES: Record<string, LlmImage["mediaType"]> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const SYSTEM_PROMPT = `You are a strict visual judge comparing two website screenshots:
a REFERENCE design and the CURRENT implementation. Output a JSON object with:
  - score: integer 0-100, how closely the CURRENT matches the REFERENCE in layout, typography,
    color palette, spacing, and component design. 100 = pixel-equivalent. 90+ = visually
    indistinguishable to a casual observer. Below 80 = noticeable mismatches.
  - differences: array of short strings describing concrete visual mismatches in order of
    severity. Be specific (e.g. "hero heading is smaller than reference", "project cards
    use a different border radius"). Empty array if no meaningful differences.
Output ONLY the JSON object, no prose, no markdown fences.`;

export interface JudgeVerdict {
  score: number;
  differences: string[];
}

export interface JudgeConfig {
  model?: string;
  temperature?: number;
}

export class Judge {
  private llm: LlmClient;
  private model: string;
  private temperature: number;

  constructor(llm: LlmClient, config: JudgeConfig = {}) {
    this.llm = llm;
    this.model = config.model ?? "claude-sonnet-4-6";
    this.temperature = config.temperature ?? 0.0;
  }

  async compare(input: {
    referencePath: string;
    currentPath: string;
    screenName: string;
  }): Promise<JudgeVerdict> {
    const reference = this.loadImage(input.referencePath, `reference_${input.screenName}`);
    const current = this.loadImage(input.currentPath, `current_${input.screenName}`);

    const prompt = `Compare these two screenshots for screen "${input.screenName}".
The first image is the REFERENCE design (target).
The second image is the CURRENT implementation (what was built).
Return the JSON verdict described in the system prompt.`;

    const res = await this.llm.complete({
      prompt,
      model: this.model,
      temperature: this.temperature,
      label: `judge:${input.screenName}`,
      images: [reference, current],
      systemPrompt: SYSTEM_PROMPT,
    });

    return this.parseVerdict(res.text);
  }

  private loadImage(path: string, label: string): LlmImage {
    const ext = extname(path).toLowerCase();
    const mediaType = MEDIA_TYPES[ext];
    if (!mediaType) throw new Error(`unsupported image type: ${path}`);
    return {
      name: label,
      data: readFileSync(path).toString("base64"),
      mediaType,
    };
  }

  private parseVerdict(raw: string): JudgeVerdict {
    // Strip code fences if the model still wrapped them despite the system prompt.
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    }

    let parsed: { score?: unknown; differences?: unknown };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Judge returned invalid JSON: ${cleaned.slice(0, 200)}`);
    }

    const score = typeof parsed.score === "number" ? parsed.score : Number(parsed.score);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error(`Judge returned invalid score: ${JSON.stringify(parsed.score)}`);
    }

    const differences = Array.isArray(parsed.differences)
      ? parsed.differences.filter((d): d is string => typeof d === "string")
      : [];

    return { score, differences };
  }
}
