$ErrorActionPreference = "Stop"

$Image = "prelegal"
$Container = "prelegal-app"
$Port = if ($env:PORT) { $env:PORT } else { "8000" }

Write-Host "Building Prelegal..."
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
docker build -t $Image "$ScriptDir\.."

Write-Host "Starting Prelegal on http://localhost:$Port"
docker run -d `
  --name $Container `
  --restart unless-stopped `
  -p "${Port}:8000" `
  -v prelegal-data:/data `
  $Image

Write-Host "Running at http://localhost:$Port"
