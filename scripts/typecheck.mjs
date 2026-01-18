import { spawnSync } from "node:child_process";

const cmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const r = spawnSync(cmd, ["tsc", "-b", "--noEmit"], { stdio: "inherit" });
process.exit(r.status ?? 1);
