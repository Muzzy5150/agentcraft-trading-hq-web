$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
node --env-file=.env.local --import tsx publisher/index.ts
if ($LASTEXITCODE -ne 0) { throw 'Publisher stopped. Check local settings; do not post secrets in logs.' }
