import fs from "node:fs";
import path from "node:path";
import {
  normalizeLedger,
  normalizeEvaluations,
  historicalSnapshot,
} from "../lib/normalize";
const root = process.argv[2];
if (!root) throw Error("Pass read-only source root");
const ledgerPath = path.join(root, "data/state.json"),
  evaluationPath = path.join(root, "data/state.evaluations.json");
const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const evaluations = JSON.parse(fs.readFileSync(evaluationPath, "utf8"));
if (evaluations.mode !== "LIVE") throw Error("Refusing synthetic history");
const sourceTimestamp = new Date(
  Math.max(
    fs.statSync(ledgerPath).mtimeMs,
    fs.statSync(evaluationPath).mtimeMs,
  ),
).toISOString();
const events = [
  ...normalizeLedger(ledger, "main-hq-original"),
  ...normalizeEvaluations(evaluations, "main-hq-original"),
].sort((a, b) => b.sourceTimestamp.localeCompare(a.sourceTimestamp));
fs.writeFileSync(
  "public/data/history.json",
  JSON.stringify(
    {
      events,
      snapshot: historicalSnapshot(ledger, evaluations, sourceTimestamp),
      importedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    events: events.length,
    sharedFills: events.filter(
      (e) => e.type === "paper_fill" && e.account === "shared",
    ).length,
    evaluationFills: events.filter(
      (e) => e.type === "paper_fill" && e.account === "evaluation",
    ).length,
    sourceTimestamp,
  }),
);
