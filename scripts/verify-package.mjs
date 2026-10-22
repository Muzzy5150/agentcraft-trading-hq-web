import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "agentcraft-clean-install-"));
const zip = path.resolve("release/agentcraft-reporting-kit-0.1.0.zip");
function run(command, args, cwd) {
  const r = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (r.status !== 0)
    throw Error(`${command} failed: ${r.stderr.slice(0, 200)}`);
  return r.stdout;
}
try {
  run("unzip", ["-q", zip, "-d", tmp], tmp);
  const root = path.join(tmp, fs.readdirSync(tmp)[0]);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "MANIFEST.json")),
  );
  for (const f of manifest.files) {
    if (
      crypto
        .createHash("sha256")
        .update(fs.readFileSync(path.join(root, f.file)))
        .digest("hex") !== f.sha256
    )
      throw Error("Manifest mismatch");
  }
  run("bash", ["scripts/setup.sh"], root);
  const output = run(
    "node",
    [
      "--import",
      "tsx",
      "--input-type=module",
      "-e",
      "import { Queue } from './publisher/queue.ts'; import { normalizeLedger } from './lib/normalize.ts'; import fs from 'node:fs'; const q = new Queue('test.sqlite'); if(q.take().length) throw Error('Queue must start empty');q.close();if(fs.existsSync('data/state.json'))throw Error('Personal ledger included');console.log('Fresh queue, working adapter import, no game data');",
    ],
    root,
  );
  console.log(output.trim());
  console.log(
    "Verified reporting-kit clean installation on macOS. Full HQ and Windows not verified.",
  );
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
