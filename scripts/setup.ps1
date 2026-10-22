$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22.13+ first.' }
node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major<22||(major===22&&minor<13))throw Error("Node.js 22.13+ required")'
if ($LASTEXITCODE -ne 0) { throw 'Unsupported Node.js version.' }
npm ci
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
if (-not (Test-Path '.env.local')) { Copy-Item '.env.example' '.env.local' }
Write-Host 'Configure .env.local locally. No engine or game files were changed.'
