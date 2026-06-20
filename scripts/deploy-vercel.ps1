# Deploy ImmigrationAssist to Vercel (run from project root)
# Requires: GitHub repo pushed, Vercel account, Neon DATABASE_URL

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$repoUrl = "https://github.com/Slypy1111/immigration-assist"
$importUrl = "https://vercel.com/new/clone?repository-url=$([uri]::EscapeDataString($repoUrl))"

Write-Host "ImmigrationAssist — Vercel deployment" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Create a permanent Neon database at https://neon.tech" -ForegroundColor Yellow
Write-Host "2. Import this repo in Vercel (browser):" -ForegroundColor Yellow
Write-Host "   $importUrl" -ForegroundColor White
Write-Host ""
Write-Host "3. Set these Environment Variables in Vercel:" -ForegroundColor Yellow
Write-Host "   DATABASE_URL          = Neon connection string"
Write-Host "   AUTH_MODE             = dev"
Write-Host "   NEXT_PUBLIC_AUTH_MODE = dev"
Write-Host "   MOCK_AI               = true"
Write-Host "   NEXT_PUBLIC_APP_URL   = https://YOUR-PROJECT.vercel.app"
Write-Host ""
Write-Host "4. Deploy — build runs prisma migrate deploy automatically."
Write-Host "5. Share with lawyers:" -ForegroundColor Green
Write-Host "   App:  https://YOUR-PROJECT.vercel.app"
Write-Host "   Help: https://YOUR-PROJECT.vercel.app/help"
Write-Host ""

if (Get-Command vercel -ErrorAction SilentlyContinue) {
  Write-Host "Attempting Vercel CLI deploy..." -ForegroundColor Cyan
  npx vercel deploy --prod --yes
  if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "CLI deploy failed (often network/TLS). Use the import URL above in your browser." -ForegroundColor Yellow
    exit 1
  }
} else {
  Write-Host "Vercel CLI not found. Use the import URL above." -ForegroundColor Yellow
}
