$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$windowsScript = (Join-Path $PSScriptRoot 'build-linux.sh').Replace('\', '/')
$wslScript = (wsl.exe -d Ubuntu -- wslpath -a $windowsScript).Trim()
if (-not $wslScript) { throw 'Cannot resolve build-linux.sh inside WSL.' }
wsl.exe -d Ubuntu -- bash $wslScript
if ($LASTEXITCODE -ne 0) { throw "Linux build failed with exit code $LASTEXITCODE." }
Write-Host "Linux backend executable: $(Join-Path $projectRoot 'build\ontology-api')"
