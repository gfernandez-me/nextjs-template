#!/bin/bash
# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the Git MCP server
exec npx -y @cyanheads/git-mcp-server
