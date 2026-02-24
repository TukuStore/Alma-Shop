# Figma MCP Integration Setup Guide

## Overview

This project now supports **Model Context Protocol (MCP)** integration with Figma, allowing you to:
- Access Figma designs directly from Claude Code
- Generate code from Figma designs
- Inspect design properties and styles
- Sync design tokens with your codebase

## Prerequisites

1. **Figma Account**: You need a Figma account with access to design files
2. **Figma Access Token**: Personal Access Token from Figma
3. **Node.js**: Installed (already required for this project)

## Step 1: Get Your Figma Access Token

1. Log in to [Figma](https://www.figma.com)
2. Go to **Settings** → **Account Settings**
3. Scroll to **Personal Access Tokens**
4. Click **Generate new token**
5. Give it a name (e.g., "Claude Code - AlmaStore")
6. Copy the token (it will look like: `figd_xxxxxxxxxxxx`)
7. **Store it securely** - you won't be able to see it again!

## Step 2: Configure MCP Server

### Option A: Using Project Configuration (Recommended)

Edit `.claude/mcp_settings.json` in your project root:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_TOKEN_HERE",
        "FIGMA_FILE_KEY": "YOUR_FILE_KEY_HERE"
      }
    }
  }
}
```

### Option B: Using Environment Variables

Create a `.env` file in your project root:

```env
FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN_HERE
FIGMA_FILE_KEY=YOUR_FILE_KEY
```

Then update `.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${FIGMA_ACCESS_TOKEN}",
        "FIGMA_FILE_KEY": "${FIGMA_FILE_KEY}"
      }
    }
  }
}
```

## Step 3: Get Your Figma File Key

1. Open your design file in Figma
2. The file key is in the URL:
   ```
   https://www.figma.com/file/{FILE_KEY}/Your-File-Name
   ```
3. Copy just the file key part (e.g., `ABCD1234EFGH5678`)

## Step 4: Restart Claude Code

After configuring the MCP server:
1. Close Claude Code completely
2. Reopen the project
3. The MCP server will start automatically

## Usage

### Access Figma Designs

Once configured, you can ask Claude to:

```
"Read the Figma file and show me the main screen design"
```

```
"Generate React Native code for this component from Figma"
```

```
"What are the design tokens used in this Figma file?"
```

```
"Compare the current implementation with the Figma design"
```

### Available MCP Tools

The Figma MCP server provides these tools:

1. **`mcp__figma__read_file`** - Read a Figma file
2. **`mcp__figma__read_node`** - Read a specific node in Figma
3. **`mcp__figma__search_nodes`** - Search for nodes in Figma
4. **`mcp__figma__get_file_key`** - Get file key from URL
5. **`mcp__figma__get_component_sets`** - Get component sets
6. **`mcp__figma__get_components`** - Get components
7. **`mcp__figma__get_design_tokens`** - Extract design tokens

### Example Workflows

#### 1. Generate Code from Design

```
"Look at the ProductCard component in Figma and generate a React Native component with the exact styling"
```

#### 2. Sync Design Tokens

```
"Extract all colors from the Figma file and update our Colors constant"
```

#### 3. Audit Implementation

```
"Compare the home screen in Figma with the current implementation and list any differences"
```

#### 4. Document Design System

```
"Analyze the Figma file and create documentation for our design system components"
```

## Troubleshooting

### MCP Server Not Starting

1. Check that Node.js is installed: `node --version`
2. Try installing the MCP server manually:
   ```bash
   npx -y @modelcontextprotocol/server-figma
   ```
3. Check Claude Code logs for errors

### Figma API Errors

1. **Invalid Token**: Verify your access token is correct and not expired
2. **File Not Found**: Check that the file key is correct and you have access
3. **Permission Denied**: Ensure your token has access to the file

### Token Not Working

1. Generate a new token from Figma settings
2. Make sure you're not including extra spaces
3. Check that the token starts with `figd_`

## Security Best Practices

1. **Never commit tokens to git** - Add `.env` to `.gitignore`
2. **Use project-specific tokens** - Don't use personal tokens for production
3. **Rotate tokens regularly** - Update tokens every 90 days
4. **Limit token permissions** - Only grant necessary access

## Advanced Configuration

### Multiple Figma Files

```json
{
  "mcpServers": {
    "figma-design": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${DESIGN_TOKEN}",
        "FIGMA_FILE_KEY": "${DESIGN_FILE_KEY}"
      }
    },
    "figma-prototypes": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "${PROTOTYPE_TOKEN}",
        "FIGMA_FILE_KEY": "${PROTOTYPE_FILE_KEY}"
      }
    }
  }
}
```

### Team Libraries

To access team libraries:

```json
{
  "env": {
    "FIGMA_ACCESS_TOKEN": "${FIGMA_TOKEN}",
    "FIGMA_FILE_KEY": "",
    "FIGMA_TEAM_ID": "YOUR_TEAM_ID"
  }
}
```

## Related Resources

- [MCP Figma Server Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/figma)
- [Figma API Documentation](https://www.figma.com/developers/api)
- [Claude Code MCP Guide](https://code.anthropic.com/docs/mcp)

## Quick Start Example

1. **Configure the server** (see Step 2)
2. **Restart Claude Code**
3. **Ask Claude**:
   ```
   "Connect to Figma and show me the current design file structure"
   ```
4. **Generate code**:
   ```
   "Create a React Native component for the product card based on the Figma design"
   ```

## Support

For issues with:
- **Figma API**: Check [Figma Status](https://status.figma.com/)
- **MCP Server**: Check [GitHub Issues](https://github.com/modelcontextprotocol/servers/issues)
- **Claude Code**: Check [Claude Code Docs](https://code.anthropic.com/docs)

---

**Happy designing! 🎨✨**
