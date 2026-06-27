import { spawn } from "node:child_process";

interface ProcessResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runNpmScript(cwd: string, script: string): Promise<ProcessResult> {
  return new Promise((resolveP) => {
    const child = spawn("npm", ["run", script], {
      cwd,
      shell: true,
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (b) => (stdout += b.toString()));
    child.stderr.on("data", (b) => (stderr += b.toString()));

    child.on("close", (code) => {
      resolveP({ exitCode: code ?? -1, stdout, stderr });
    });
  });
}

export function makeProcessTools(sandboxRoot: string) {
  return {
    run_build: async () => runNpmScript(sandboxRoot, "build"),
    run_lint: async () => runNpmScript(sandboxRoot, "lint"),
  };
}
