#!/bin/bash

# Launcher for Aurorae Haven (macOS - double-click support)
# This file should have the .command extension for macOS double-click support

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Run the main launcher script
./start-aurorae-haven.sh
