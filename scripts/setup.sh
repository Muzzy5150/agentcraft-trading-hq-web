#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo 'Install Node.js 22.13+ first.' >&2; exit 1; }
node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major<22||(major===22&&minor<13))throw Error("Node.js 22.13+ required")'
npm ci
[ -f .env.local ] || cp .env.example .env.local
printf '%s\n' 'Dependencies ready. Configure .env.local locally. No engine or game files were changed.'
