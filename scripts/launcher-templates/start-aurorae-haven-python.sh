#!/bin/bash

# Launcher for Aurorae Haven using Python (Linux/macOS)

echo ""
echo "========================================"
echo "  Aurorae Haven - Starting (Python)..."
echo "========================================"
echo ""

# Check if Python is installed
if command -v python3 &> /dev/null; then
    python3 embedded-server.py
elif command -v python &> /dev/null; then
    python embedded-server.py
else
    echo "ERROR: Python is not installed!"
    echo ""
    echo "Please install Python:"
    echo "  - macOS: brew install python3"
    echo "  - Linux: sudo apt install python3 (or use your package manager)"
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo ""
read -p "Press Enter to exit..."
