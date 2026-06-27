import Anthropic from "@anthropic-ai/sdk";

export interface LlmCompletion {
  text: string;
  tokensIn: number;
  tokensOut: number;
}

export interface LlmImage {
  name: string;
  /** Base64-encoded image bytes. */
  data: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
}

export interface LlmClient {
  complete(input: {
    prompt: string;
    model: string;
    temperature: number;
    maxTokens?: number;
    /**
     * If set, the assistant response is prefilled with this string. Used to force JSON.
     * Ignored when `images` is provided (the multimodal streaming form can't easily prefill).
     */
    prefill?: string;
    /** Optional label for logging (e.g. "planner", "summarizer"). */
    label?: string;
    /** Reference images attached to the user message. Switches to streaming multimodal mode. */
    images?: LlmImage[];
    /** Per-call system prompt. Overrides the client's default. */
    systemPrompt?: string;
  }): Promise<LlmCompletion>;
}

export class AnthropicClient implements LlmClient {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
    });
  }

  async complete(input: {
    prompt: string;
    model: string;
    temperature: number;
    maxTokens?: number;
    prefill?: string;
  }): Promise<LlmCompletion> {
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: input.prompt },
    ];
    if (input.prefill) {
      messages.push({ role: "assistant", content: input.prefill });
    }

    const res = await this.client.messages.create({
      model: input.model,
      max_tokens: input.maxTokens ?? 4096,
      temperature: input.temperature,
      messages,
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    return {
      text: (input.prefill ?? "") + text,
      tokensIn: res.usage.input_tokens,
      tokensOut: res.usage.output_tokens,
    };
  }
}

/**
 * Routes calls through the locally-authenticated Claude Code CLI via the
 * Agent SDK, so usage bills against the user's Claude Code subscription
 * rather than API credits.
 *
 * Notes:
 *   - `temperature` and `maxTokens` are ignored (Agent SDK does not expose them).
 *   - `prefill` is ignored — there is no assistant-prefill in the Agent SDK.
 *     Planner relies on its retry loop to recover from non-JSON output.
 *   - Built-in tools are disabled (`tools: []`) for pure-text completion.
 */
export class ClaudeAgentClient implements LlmClient {
  async complete(input: {
    prompt: string;
    model: string;
    temperature: number;
    maxTokens?: number;
    prefill?: string;
    label?: string;
    images?: LlmImage[];
    systemPrompt?: string;
  }): Promise<LlmCompletion> {
    const label = input.label ?? "llm";
    const promptK = (input.prompt.length / 1000).toFixed(1);
    const imgCount = input.images?.length ?? 0;
    const t0 = Date.now();
    console.log(
      `    [${label}] → ${input.model} (prompt: ${promptK}k chars${
        imgCount > 0 ? `, ${imgCount} image(s)` : ""
      })`,
    );

    const ticker = setInterval(() => {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
      console.log(`    [${label}]   ...${elapsed}s elapsed`);
    }, 15000);

    try {
      // ESM-only package — dynamic import keeps this file CJS-compatible.
      const { query } = await import("@anthropic-ai/claude-agent-sdk");

      const sharedOptions = {
        model: input.model,
        tools: [] as string[],
        systemPrompt:
          input.systemPrompt ??
          "You are a planning assistant. Respond with ONLY a single valid JSON object. No prose, no markdown fences, no commentary.",
      };

      const q = input.images && input.images.length > 0
        ? this.multimodalQuery(
            query as unknown as (params: { prompt: unknown; options: unknown }) => unknown,
            input.prompt,
            input.images,
            sharedOptions,
          )
        : query({ prompt: input.prompt, options: sharedOptions });

      let text: string | undefined;
      let tokensIn = 0;
      let tokensOut = 0;

      for await (const msg of q) {
        if (msg.type === "result") {
          if (msg.subtype === "success") {
            text = msg.result;
            tokensIn = msg.usage?.input_tokens ?? 0;
            tokensOut = msg.usage?.output_tokens ?? 0;
            break;
          }
          throw new Error(`Claude Agent SDK returned error: ${msg.subtype}`);
        }
      }

      if (text === undefined) {
        throw new Error("Claude Agent SDK closed without a result message");
      }

      const dt = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(
        `    [${label}] ← ${tokensIn} in / ${tokensOut} out tokens, ${dt}s`,
      );
      return { text, tokensIn, tokensOut };
    } finally {
      clearInterval(ticker);
    }
  }

  /**
   * Builds a streaming user message iterable carrying text + images and
   * returns the resulting Query. The SDK's types are ESM-only and CJS can't
   * type-import them cleanly, so the shape is loosely typed here — the
   * runtime contract matches the captioner's multimodal call exactly.
   */
  private multimodalQuery(
    query: (params: { prompt: unknown; options: unknown }) => unknown,
    prompt: string,
    images: LlmImage[],
    options: { model: string; tools: string[]; systemPrompt: string },
  ): AsyncIterable<{ type: string; subtype?: string; result?: string; usage?: { input_tokens?: number; output_tokens?: number } }> {
    const content: Anthropic.ContentBlockParam[] = [
      { type: "text", text: prompt },
    ];
    for (const img of images) {
      content.push({ type: "text", text: `\n\nReference image: ${img.name}` });
      content.push({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.data },
      });
    }

    async function* messageStream() {
      yield {
        type: "user" as const,
        message: { role: "user" as const, content },
        parent_tool_use_id: null,
      };
    }

    return query({
      prompt: messageStream(),
      options,
    }) as AsyncIterable<{ type: string; subtype?: string; result?: string; usage?: { input_tokens?: number; output_tokens?: number } }>;
  }
}
