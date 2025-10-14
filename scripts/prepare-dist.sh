#!/usr/bin/env bash
set -euo pipefail
# Prepare distribution folder from build
# NOTE: The 'dist' directory name is defined in scripts/buildConstants.js
# If changing the directory name, update both files to maintain consistency.

echo "📦 Preparing dist folder..."

# Remove old dist folder if exists
rm -rf dist

# Copy build to dist
if [ -d "build" ]; then
  mkdir -p dist
  cp -r build/* dist/
  echo "✓ Copied contents of build/ to dist/"
else
  echo "❌ Error: build/ directory not found"
  exit 1
fi

# Copy legacy standalone files for backward compatibility
echo "📄 Copying legacy standalone files for backward compatibility..."

# Create required directories in dist
mkdir -p dist/src/utils
mkdir -p dist/src/assets/styles

# Copy utility JS
cp src/utils/pageHelpers.js dist/src/utils/

# Copy styles
cp src/assets/styles/styles.css dist/src/assets/styles/

# Copy main entry points
cp src/main.js dist/src/
cp src/braindump-ui.js dist/src/

# Optionally copy braindump-enhanced.js if it exists
if [ -f src/braindump-enhanced.js ]; then
  cp src/braindump-enhanced.js dist/src/
  echo "✓ Copied src/braindump-enhanced.js"
fi
# List contents
echo "✓ dist/ contents:"
ls -la dist/

echo "✓ Distribution folder ready!"
