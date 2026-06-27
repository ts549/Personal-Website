import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

import type { SessionState } from "./types";

export function loadSession(path: string): SessionState | undefined {
  if (!existsSync(path)) return undefined;
  const raw = readFileSync(path, "utf8");
  if (!raw.trim()) return undefined;
  return parseYaml(raw) as SessionState;
}

export function writeSession(path: string, state: SessionState): void {
  writeFileSync(path, stringifyYaml(state), "utf8");
}

export function newSession(goal: string): SessionState {
  return {
    session_id: randomUUID(),
    started_at: new Date().toISOString(),
    goal,
    status: "running",
    iterations: [],
  };
}
