import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const GOAL_YML_PATH = join(__dirname, "config", "goal.yml");

export interface GoalConfig {
  name: string;
  description: string;
  environment?: string;
  success_criteria?: string[];
  constraints?: Record<string, string>;
  priorities?: string[];
}

export function loadGoalConfig(): GoalConfig {
  return parseYaml(readFileSync(GOAL_YML_PATH, "utf8")) as GoalConfig;
}

/**
 * Renders the goal.yml content into the two strings the planner consumes:
 *   goal    — the imperative task (name + description)
 *   context — the supporting frame (environment + criteria + constraints)
 */
export function renderGoal(config: GoalConfig): { goal: string; context: string } {
  const goal = `${config.name}\n\n${config.description.trim()}`;

  const parts: string[] = [];
  if (config.environment) parts.push(`Environment:\n${config.environment.trim()}`);
  if (config.constraints && Object.keys(config.constraints).length > 0) {
    const lines = Object.entries(config.constraints).map(
      ([k, v]) => `  - ${k}: ${v}`,
    );
    parts.push(`Constraints:\n${lines.join("\n")}`);
  }
  if (config.success_criteria && config.success_criteria.length > 0) {
    const lines = config.success_criteria.map((c) => `  - ${c}`);
    parts.push(
      `Success criteria (these define "done" — the verifier will check them):\n${lines.join("\n")}`,
    );
  }
  if (config.priorities && config.priorities.length > 0) {
    const lines = config.priorities.map((p, i) => `  ${i + 1}. ${p}`);
    parts.push(`Priorities (in order):\n${lines.join("\n")}`);
  }

  return { goal, context: parts.join("\n\n") };
}
