# Figma MCP Setup Script for Windows
# This script helps configure the Figma MCP integration

Write-Host "🎨 Figma MCP Setup for AlmaStore" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (!(Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    New-Item -Path .env -ItemType File | Out-Null
}

# Prompt for Figma token
Write-Host "Please enter your Figma Access Token:" -ForegroundColor White
Write-Host "(Get it from: https://www.figma.com/settings → Personal Access Tokens)" -ForegroundColor Gray
$FIGMA_TOKEN = Read-Host "Token"

# Prompt for File Key
Write-Host ""
Write-Host "Please enter your Figma File Key:" -ForegroundColor White
Write-Host "(Found in the URL: https://www.figma.com/file/FILE_KEY/Name)" -ForegroundColor Gray
$FIGMA_FILE_KEY = Read-Host "File Key"

# Update .env file
Add-Content .env ""
Add-Content .env "# Figma MCP Configuration"
Add-Content .env "FIGMA_ACCESS_TOKEN=$FIGMA_TOKEN"
Add-Content .env "FIGMA_FILE_KEY=$FIGMA_FILE_KEY"

Write-Host ""
Write-Host "✅ Configuration saved to .env file!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Claude Code"
Write-Host "2. Ask: 'Connect to Figma and show me the design structure'"
Write-Host ""
Write-Host "📚 For more info, see: docs/FIGMA_MCP_SETUP.md" -ForegroundColor Cyan
