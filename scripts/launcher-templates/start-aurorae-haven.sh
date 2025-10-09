#!/bin/bash

# Launcher for Aurorae Haven (Linux/macOS)

echo ""
echo "========================================"
echo "  Aurorae Haven - Starting..."
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo ""
    echo "Please install Node.js:"
    echo "  - macOS: brew install node"
    echo "  - Linux: sudo apt install nodejs (or use your package manager)"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

# Make the script executable on first run
chmod +x embedded-server.js 2>/dev/null

# Start the embedded server
node embedded-server.js

echo ""
read -p "Press Enter to exit..."
