#!/usr/bin/env bash
set -euo pipefail

IMAGE="prelegal"
CONTAINER="prelegal-app"
PORT="${PORT:-8000}"

echo "Building Prelegal..."
docker build -t "$IMAGE" "$(dirname "$0")/.."

echo "Starting Prelegal on http://localhost:$PORT"
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  -p "$PORT:8000" \
  -v prelegal-data:/data \
  "$IMAGE"

echo "Running at http://localhost:$PORT"
