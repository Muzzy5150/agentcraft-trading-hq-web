import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
// Explicit reporting-only distribution. This is NOT an installable Minecraft HQ.
const version = JSON.parse(fs.readFileSync("package.json")).version;
const name = `agentcraft-reporting-kit-${version}`,
  root = path.resolve("release", name);
if (fs.existsSync(root)) fs.rmSync(root, { recursive: true });
fs.mkdirSync(root, { recursive: true });
const files = [
  "LICENSE",
  "THIRD_PARTY_NOTICES.md",
  ".env.example",
  "publisher/index.ts",
  "publisher/queue.ts",
  "lib/schema.ts",
  "lib/normalize.ts",
  "lib/auth.ts",
  "lib/agents.ts",
  "scripts/setup.sh",
  "scripts/setup.ps1",
  "scripts/launch-publisher.sh",
  "scripts/launch-publisher.ps1",
  "docs/PUBLISHER.md",
];
for (const file of files) {
  if (fs.lstatSync(file).isSymbolicLink()) throw Error("Symlink forbidden");
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.copyFileSync(file, path.join(root, file));
}
const pkg = JSON.parse(fs.readFileSync("package.json"));
fs.writeFileSync(
  path.join(root, "package.json"),
  JSON.stringify(
    {
      name: "agentcraft-reporting-kit",
      version,
      type: "module",
      private: true,
      engines: pkg.engines,
      scripts: { publisher: "tsx publisher/index.ts" },
      dependencies: { tsx: pkg.devDependencies.tsx, zod: pkg.dependencies.zod },
    },
    null,
    2,
  ),
);
// Generic labels for redistributed reporting configuration; stable source IDs stay intact.
const generic =
  "export const agents=" +
  JSON.stringify(
    [
      "alon",
      "wren",
      "juniper",
      "kit",
      "rowan",
      "tove",
      "sable",
      "nova",
      "delta",
      "pixel",
      "echo",
      "byte",
    ].map((id, i) => ({ id, name: `Agent ${String(i + 1).padStart(2, "0")}` })),
  ) +
  ";\n";
fs.writeFileSync(path.join(root, "lib/agents.ts"), generic);
fs.writeFileSync(
  path.join(root, "README.md"),
  "# AgentCraft reporting kit " +
    version +
    "\n\nRead-only outbound publisher for an EXISTING, separately installed AgentCraft HQ. This package contains no Minecraft runtime, game assets, ledger, credentials or character art. It does not create or reset any paper account. See docs/PUBLISHER.md.\n\nmacOS: bash scripts/setup.sh\nWindows: powershell -File scripts/setup.ps1\n\nSet source paths and secure credentials in your own .env.local. Start with scripts/launch-publisher.sh or scripts/launch-publisher.ps1.\n",
);
const lock = spawnSync(
  "npm",
  ["install", "--package-lock-only", "--ignore-scripts"],
  { cwd: root, encoding: "utf8" },
);
if (lock.status !== 0) throw Error("Lockfile creation failed");
const manifest = [];
function scan(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) scan(file);
    else {
      const rel = path.relative(root, file),
        buf = fs.readFileSync(file);
      if (
        /(?:\.env\.(?:local|production)|state\.json|\.jar$|\.bbmodel$|\.sqlite|\.png$|\.webp$)/.test(
          rel,
        )
      )
        throw Error("Private or unapproved file");
      if (
        /(?:sb_secret_[A-Za-z0-9_-]{15}|sk-[A-Za-z0-9]{20}|gh[pousr]_[A-Za-z0-9]{20}|-----BEGIN.*PRIVATE KEY)/.test(
          buf.toString(),
        )
      )
        throw Error("Credential signature found");
      manifest.push({
        file: rel,
        bytes: buf.length,
        sha256: crypto.createHash("sha256").update(buf).digest("hex"),
      });
    }
  }
}
scan(root);
fs.writeFileSync(
  path.join(root, "MANIFEST.json"),
  JSON.stringify(
    { kind: "reporting-kit-only", version, files: manifest },
    null,
    2,
  ),
);
const archive = path.resolve("release", name + ".zip");
if (fs.existsSync(archive)) fs.unlinkSync(archive);
const result = spawnSync("zip", ["-qr", archive, name], {
  cwd: path.dirname(root),
});
if (result.status !== 0) throw Error("ZIP failed");
fs.writeFileSync(
  archive + ".sha256",
  crypto.createHash("sha256").update(fs.readFileSync(archive)).digest("hex") +
    "  " +
    path.basename(archive) +
    "\n",
);
console.log(
  JSON.stringify({
    archive,
    files: manifest.length,
    kind: "reporting-kit-only",
    fullHQRelease: false,
  }),
);
