import { resolve, sep } from "node:path";

/**
 * Resolves a user-supplied relative path against the sandbox root and
 * throws if the result would escape the sandbox.
 *
 * Rejects: absolute paths, .. traversal, anything resolving outside root.
 */
export function resolveInSandbox(sandboxRoot: string, userPath: string): string {
  if (typeof userPath !== "string" || userPath.length === 0) {
    throw new Error("path must be a non-empty string");
  }

  const root = resolve(sandboxRoot);
  const target = resolve(root, userPath);

  if (target !== root && !target.startsWith(root + sep)) {
    throw new Error(`path escapes sandbox: ${userPath}`);
  }

  return target;
}
