$ErrorActionPreference = "Stop"

$Container = "prelegal-app"

Write-Host "Stopping Prelegal..."
docker stop $Container 2>$null
docker rm $Container 2>$null
Write-Host "Stopped."
