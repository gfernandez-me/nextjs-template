#!/bin/bash
# Non-interactive command wrapper for Cursor chat
# This script ensures commands complete without hanging

set -e

# Function to run command with non-interactive flags
run_noninteractive() {
    local cmd="$1"
    
    # Use script to capture output without TTY issues
    if command -v script >/dev/null 2>&1; then
        script -q -c "$cmd" /dev/null
    else
        # Fallback to stdbuf for line buffering
        stdbuf -oL -eL bash -lc "$cmd"
    fi
}

# Main execution
if [ $# -eq 0 ]; then
    echo "Usage: $0 <command>"
    echo "Example: $0 'npm run build:ci'"
    exit 1
fi

# Set non-interactive environment
export DEBIAN_FRONTEND=noninteractive
export CI=1
export FORCE_COLOR=0
export NO_COLOR=1
export TERM=xterm

# Run the command
run_noninteractive "$*"
