#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
exec node --env-file=.env.local --import tsx publisher/index.ts
