# Quit Dce task manager, clear Electron cache, optional fresh launch with --reset-cache
$ErrorActionPreference = "Stop"

Write-Host "Stopping Dce task manager..."
Get-Process -Name "Dce task manager" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

$roaming = Join-Path $env:APPDATA "Dce task manager"
if (Test-Path $roaming) {
  Write-Host "Removing cache/data: $roaming"
  Remove-Item -LiteralPath $roaming -Recurse -Force
} else {
  Write-Host "No Roaming profile folder found (already clean)."
}

$exe = Join-Path ${env:LOCALAPPDATA} "Programs\Dce task manager\Dce task manager.exe"
if (Test-Path $exe) {
  Write-Host "Launching with --reset-cache..."
  Start-Process -FilePath $exe -ArgumentList "--reset-cache"
} else {
  Write-Host "Install the app first, then run this script again."
  Write-Host "Expected: $exe"
}
