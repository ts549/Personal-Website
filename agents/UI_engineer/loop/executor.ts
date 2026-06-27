import { Plan, PlanStep } from "./types"; // or types.ts later
import { ExecutionResult, ExecutorConfig } from "./types";

/**
 * Executor runs a plan step-by-step and produces a trace
 * that can be validated by the verifier.
 */
export class Executor {
  private config: ExecutorConfig;

  constructor(config: ExecutorConfig = {}) {
    this.config = {
      enableReasoningSteps: config.enableReasoningSteps ?? false,
      toolRegistry: config.toolRegistry,
    };
  }

  async run(plan: Plan): Promise<{
    results: ExecutionResult[];
    success: boolean;
  }> {
    const results: ExecutionResult[] = [];

    for (const step of plan.steps) {
      const result = await this.executeStep(step);
      results.push(result);

      // hard-fail option (can later make configurable)
      if (result.status === "failed") {
        return {
          results,
          success: false,
        };
      }
    }

    return {
      results,
      success: true,
    };
  }

  private async executeStep(step: PlanStep): Promise<ExecutionResult> {
    try {
      switch (step.type) {
        case "action":
          return this.handleAction(step);

        case "tool_call":
          return await this.handleToolCall(step);

        case "reason":
          return this.handleReason(step);

        case "condition":
          return this.handleCondition(step);

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
    } catch (err: any) {
      return {
        stepId: step.id,
        status: "failed",
        error: err.message ?? String(err),
      };
    }
  }

  /**
   * Simple internal step (no external effects yet)
   */
  private handleAction(step: PlanStep): ExecutionResult {
    return {
      stepId: step.id,
      status: "success",
      output: {
        message: step.description,
      },
    };
  }

  /**
   * Tool execution via registry
   */
  private async handleToolCall(step: PlanStep): Promise<ExecutionResult> {
    if (!this.config.toolRegistry) {
      throw new Error("No tool registry provided");
    }

    if (!step.tool) {
      throw new Error("Tool call step missing 'tool' field");
    }

    const output = await this.config.toolRegistry.execute(
      step.tool,
      step.input ?? {}
    );

    return {
      stepId: step.id,
      status: "success",
      output,
    };
  }

  /**
   * Reasoning step (optional LLM hook later)
   */
  private handleReason(step: PlanStep): ExecutionResult {
    if (!this.config.enableReasoningSteps) {
      return {
        stepId: step.id,
        status: "skipped",
      };
    }

    return {
      stepId: step.id,
      status: "success",
      output: {
        reasoning: step.description,
      },
    };
  }

  /**
   * Placeholder for branching logic (not implemented yet)
   */
  private handleCondition(step: PlanStep): ExecutionResult {
    return {
      stepId: step.id,
      status: "success",
      output: {
        note: "condition step not yet implemented",
      },
    };
  }
}