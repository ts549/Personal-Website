import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";

import { resolveInSandbox } from "./sandbox";

export function makeFileTools(sandboxRoot: string) {
  return {
    read_file: (input: { path: string }) => {
      const target = resolveInSandbox(sandboxRoot, input.path);
      if (!existsSync(target)) throw new Error(`not found: ${input.path}`);
      return { content: readFileSync(target, "utf8") };
    },

    list_files: (input: { path: string }) => {
      const target = resolveInSandbox(sandboxRoot, input.path);
      if (!existsSync(target)) throw new Error(`not found: ${input.path}`);
      if (!statSync(target).isDirectory()) {
        throw new Error(`not a directory: ${input.path}`);
      }
      const entries = readdirSync(target, { withFileTypes: true })
        .filter((e) => e.name !== "node_modules" && e.name !== ".next")
        .map((e) => ({ name: e.name, type: e.isDirectory() ? "dir" : "file" }));
      return { path: input.path, entries };
    },

    edit_file: (input: { path: string; old_string: string; new_string: string }) => {
      const target = resolveInSandbox(sandboxRoot, input.path);
      if (!existsSync(target)) throw new Error(`not found: ${input.path}`);

      const content = readFileSync(target, "utf8");
      const occurrences = content.split(input.old_string).length - 1;
      if (occurrences === 0) {
        throw new Error(`old_string not found in ${input.path}`);
      }
      if (occurrences > 1) {
        throw new Error(
          `old_string occurs ${occurrences} times in ${input.path}; must be unique`,
        );
      }

      writeFileSync(target, content.replace(input.old_string, input.new_string), "utf8");
      return { updated: input.path };
    },

    create_file: (input: { path: string; content: string }) => {
      const target = resolveInSandbox(sandboxRoot, input.path);
      if (existsSync(target)) {
        throw new Error(`already exists: ${input.path}`);
      }
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, input.content, "utf8");
      return { created: input.path };
    },

    write_file: (input: { path: string; content: string }) => {
      const target = resolveInSandbox(sandboxRoot, input.path);
      mkdirSync(dirname(target), { recursive: true });
      const existed = existsSync(target);
      writeFileSync(target, input.content, "utf8");
      return { path: input.path, action: existed ? "overwritten" : "created" };
    },

    delete_file: (input: { path: string }) => {
      const target = resolveInSandbox(sandboxRoot, input.path);
      if (!existsSync(target)) throw new Error(`not found: ${input.path}`);
      rmSync(target);
      return { deleted: input.path };
    },
  };
}
