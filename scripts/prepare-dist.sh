#!/bin/bash
set -euo pipefail
# Prepare distribution folder from build

echo "📦 Preparing dist folder..."

# Remove old dist folder if exists
rm -rf dist

# Copy build to dist
if [ -d "build" ]; then
  cp -r build dist
  echo "✓ Copied build/ to dist/"
else
  echo "❌ Error: build/ directory not found"
  exit 1
fi

# List contents
echo "✓ dist/ contents:"
ls -la dist/

echo "✓ Distribution folder ready!"
