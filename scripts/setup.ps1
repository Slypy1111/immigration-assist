# ImmigrationAssist — local setup (Windows)
# For IT/deployers only. Lawyers use the browser URL — no install needed.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is required: https://nodejs.org/" -ForegroundColor Red
  exit 1
}

Write-Host "Installing dependencies..."
npm install

if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host ""
  Write-Host "Created .env — edit DATABASE_URL with your Neon connection string:" -ForegroundColor Yellow
  Write-Host "  https://neon.tech" -ForegroundColor Yellow
  Write-Host ""
  exit 0
}

Write-Host "Running database setup (migrate + seed)..."
npm run setup

Write-Host ""
Write-Host "Done. Start the app with: npm run dev" -ForegroundColor Green
Write-Host "Then open: http://localhost:3000/dev-login" -ForegroundColor Green
