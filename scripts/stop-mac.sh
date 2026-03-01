#!/usr/bin/env bash
set -euo pipefail

CONTAINER="prelegal-app"

echo "Stopping Prelegal..."
docker stop "$CONTAINER" 2>/dev/null || true
docker rm "$CONTAINER" 2>/dev/null || true
echo "Stopped."
