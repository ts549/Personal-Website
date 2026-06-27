import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

import type { ToolRegistry } from "../types";
import { makeFileTools } from "./file_tools";
import { makeProcessTools } from "./process_tools";

interface ToolSpec {
  description: string;
  input_schema?: unknown;
  deferred?: boolean;
}

export interface ToolsConfig {
  tools: Record<string, ToolSpec>;
}

const TOOLS_YML_PATH = join(__dirname, "..", "config", "tools.yml");

export function loadToolsConfig(): ToolsConfig {
  return parseYaml(readFileSync(TOOLS_YML_PATH, "utf8")) as ToolsConfig;
}

/**
 * Returns the spec for every non-deferred tool — what the planner prompt
 * should advertise to the model.
 */
export function activeToolSpecs(config: ToolsConfig): Record<string, ToolSpec> {
  const out: Record<string, ToolSpec> = {};
  for (const [name, spec] of Object.entries(config.tools)) {
    if (!spec.deferred) out[name] = spec;
  }
  return out;
}

export interface RegistryOptions {
  sandboxRoot: string;
  maxFilesPerIteration?: number;
}

/**
 * Assembles the live ToolRegistry consumed by Executor.
 *
 * Single point of enforcement for:
 *  - sandbox path safety (via handlers)
 *  - per-iteration file-mutation cap (configurable; default 3 per strategy.yml)
 *  - dispatch to the right handler by tool name
 */
export class Registry implements ToolRegistry {
  // Heterogeneous handler dispatch — each tool has its own input shape,
  // validated against the JSON Schema in tools.yml at call time.
  // `never` in input position is contravariant and accepts any handler signature.
  private handlers: Record<string, (input: never) => Promise<unknown> | unknown>;
  private fileMutationCount = 0;
  private readonly maxFilesPerIteration: number;

  private static readonly MUTATING_TOOLS = new Set([
    "edit_file",
    "create_file",
    "write_file",
    "delete_file",
  ]);

  constructor(options: RegistryOptions) {
    const file = makeFileTools(options.sandboxRoot);
    const proc = makeProcessTools(options.sandboxRoot);
    this.handlers = { ...file, ...proc };
    this.maxFilesPerIteration = options.maxFilesPerIteration ?? 3;
  }

  /** Called by the driver at the start of each loop iteration. */
  beginIteration(): void {
    this.fileMutationCount = 0;
  }

  async execute(tool: string, input: unknown): Promise<unknown> {
    const handler = this.handlers[tool];
    if (!handler) {
      throw new Error(`unknown tool: ${tool}`);
    }

    if (Registry.MUTATING_TOOLS.has(tool)) {
      if (this.fileMutationCount >= this.maxFilesPerIteration) {
        throw new Error(
          `file-mutation cap reached: ${this.maxFilesPerIteration} per iteration`,
        );
      }
      this.fileMutationCount++;
    }

    return handler(input as never);
  }
}
