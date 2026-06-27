import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { get as httpGet } from "node:http";
import { createServer } from "node:net";

/**
 * Long-lived Next.js dev server, owned by the Loop for the duration of a session.
 * Single instance, single port. Started once on first use, killed on shutdown.
 */
export class DevServer {
  private child?: ChildProcess;
  private port?: number;
  private cwd: string;
  private readyPromise?: Promise<void>;

  constructor(workspaceCwd: string) {
    this.cwd = workspaceCwd;
  }

  get baseUrl(): string {
    if (this.port === undefined) {
      throw new Error("DevServer not started");
    }
    return `http://localhost:${this.port}`;
  }

  isRunning(): boolean {
    return this.child !== undefined && !this.child.killed;
  }

  async start(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.readyPromise = this.spawnAndWait();
    return this.readyPromise;
  }

  private async spawnAndWait(): Promise<void> {
    this.port = await this.findFreePort();
    console.log(`    [devserver] starting next dev on port ${this.port}`);

    this.child = spawn("npm", ["run", "dev", "--", "-p", String(this.port)], {
      cwd: this.cwd,
      shell: true,
      windowsHide: true,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    let exited = false;
    let exitCode: number | null = null;
    this.child.on("exit", (code) => {
      exited = true;
      exitCode = code;
    });

    const logLine = (prefix: string, s: string) => {
      for (const line of s.split(/\r?\n/)) {
        if (line.trim().length === 0) continue;
        console.log(`    [devserver${prefix}] ${line.trim()}`);
      }
    };
    this.child.stdout?.on("data", (b) => logLine("", b.toString()));
    this.child.stderr?.on("data", (b) => logLine(":err", b.toString()));

    // Probe HTTP, not raw TCP — Next.js may briefly bind a socket before it
    // actually serves requests. Abort early if the child has already exited.
    const url = `http://127.0.0.1:${this.port}/`;
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      if (exited) {
        throw new Error(
          `dev server exited unexpectedly during startup (code ${exitCode})`,
        );
      }
      if (await this.httpReady(url)) {
        console.log(`    [devserver] ready at ${this.baseUrl}`);
        return;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(
      `dev server did not respond to HTTP on ${url} within 90s`,
    );
  }

  private httpReady(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = httpGet(url, (res) => {
        res.resume();
        // Any HTTP response — even 500 — means the server is up.
        resolve(true);
      });
      req.setTimeout(2_000, () => {
        req.destroy();
        resolve(false);
      });
      req.on("error", () => resolve(false));
    });
  }

  async stop(): Promise<void> {
    if (!this.child) return;
    const child = this.child;
    this.child = undefined;
    this.readyPromise = undefined;

    console.log(`    [devserver] stopping (pid ${child.pid ?? "?"})`);

    if (process.platform === "win32" && child.pid !== undefined) {
      // child.kill() on Windows only kills the cmd.exe wrapper. npm spawns
      // next dev as a grandchild, which gets orphaned. taskkill /T /F walks
      // the whole tree.
      try {
        spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
          windowsHide: true,
        });
      } catch {
        // best effort
      }
    } else {
      try {
        child.kill();
      } catch {
        // already dead
      }
    }

    await new Promise<void>((resolve) => {
      if (child.exitCode !== null || child.killed) return resolve();
      child.once("exit", () => resolve());
      setTimeout(resolve, 3_000);
    });
  }

  private findFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const srv = createServer();
      srv.unref();
      srv.on("error", reject);
      srv.listen(0, () => {
        const addr = srv.address();
        if (addr && typeof addr === "object") {
          const port = addr.port;
          srv.close(() => resolve(port));
        } else {
          reject(new Error("failed to get free port"));
        }
      });
    });
  }

}
