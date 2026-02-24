# Figma MCP Quick Start

## 🚀 Setup in 3 Steps

### 1. Get Figma Token
- Go to https://www.figma.com/settings
- Scroll to "Personal Access Tokens"
- Click "Generate new token"
- Copy the token (starts with `figd_`)

### 2. Run Setup Script

**Windows:**
```powershell
.\scripts\setup-figma-mcp.ps1
```

**Mac/Linux:**
```bash
bash scripts/setup-figma-mcp.sh
```

### 3. Restart Claude Code
- Close Claude Code completely
- Reopen the AlmaStore project
- MCP server will start automatically

## 💬 Example Prompts

### Design Review
```
"Review the Figma design for the home screen and compare it with our current implementation"
```

### Generate Code
```
"Generate React Native code for the product card component based on the Figma design"
```

### Extract Design Tokens
```
"Extract all color tokens from the Figma file and create a Colors constant"
```

### Component Analysis
```
"Show me the component structure and properties for the checkout screen"
```

### Design System Docs
```
"Create documentation for our design system based on the Figma components"
```

## 🎯 Common Tasks

| Task | Prompt |
|------|--------|
| View file structure | "Show me the Figma file structure" |
| Get component info | "Tell me about the ProductCard component" |
| Generate styles | "Extract styles from the header component" |
| Compare screens | "Compare the home and category screen designs" |
| Export assets | "List all image assets in the design" |

## 🔧 Available Tools

Once connected, you have access to:
- `mcp__figma__read_file` - Read entire Figma file
- `mcp__figma__read_node` - Read specific node
- `mcp__figma__search_nodes` - Search nodes by name/type
- `mcp__figma__get_design_tokens` - Extract design tokens
- `mcp__figma__get_components` - List all components
- `mcp__figma__get_component_sets` - Get component sets

## 🐛 Troubleshooting

**Not connecting?**
1. Check token is valid (not expired)
2. Verify file key is correct
3. Ensure you have access to the file

**Can't access nodes?**
1. Check file permissions
2. Verify the node exists
3. Try reconnecting

**Token errors?**
1. Generate a new token
2. Remove spaces from token
3. Check token format (should start with `figd_`)

## 📚 Full Documentation

See [FIGMA_MCP_SETUP.md](./FIGMA_MCP_SETUP.md) for detailed setup and configuration.

## 🎨 Tips

1. **Use descriptive prompts**: Be specific about what you want
2. **Reference components by name**: Use exact Figma component names
3. **Iterate**: Ask for refinements after initial code generation
4. **Version control**: Commit generated code before regenerating
5. **Test on device**: Figma designs may look different on real devices

## 🔐 Security

- ✅ `.env` is in `.gitignore` (tokens won't be committed)
- ✅ Tokens are stored locally only
- ✅ Use project-specific tokens for teams
- ✅ Rotate tokens every 90 days

---

**Need help?** Check the full [setup guide](./FIGMA_MCP_SETUP.md)
