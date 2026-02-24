#!/bin/bash

# Figma MCP Setup Script
# This script helps configure the Figma MCP integration

echo "🎨 Figma MCP Setup for AlmaStore"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    touch .env
fi

# Prompt for Figma token
echo "Please enter your Figma Access Token:"
echo "(Get it from: https://www.figma.com/settings → Personal Access Tokens)"
read -p "Token: " FIGMA_TOKEN

# Prompt for File Key
echo ""
echo "Please enter your Figma File Key:"
echo "(Found in the URL: https://www.figma.com/file/FILE_KEY/Name)"
read -p "File Key: " FIGMA_FILE_KEY

# Update .env file
echo "" >> .env
echo "# Figma MCP Configuration" >> .env
echo "FIGMA_ACCESS_TOKEN=$FIGMA_TOKEN" >> .env
echo "FIGMA_FILE_KEY=$FIGMA_FILE_KEY" >> .env

echo ""
echo "✅ Configuration saved to .env file!"
echo ""
echo "Next steps:"
echo "1. Restart Claude Code"
echo "2. Ask: 'Connect to Figma and show me the design structure'"
echo ""
echo "📚 For more info, see: docs/FIGMA_MCP_SETUP.md"
