# 🔌 MCP Integration for AlmaStore

This project includes **Model Context Protocol (MCP)** server integrations for enhanced development capabilities.

## ✨ Available MCP Servers

### 1. **Figma** 🎨
- **Purpose**: Design-to-code workflow, design token extraction
- **Setup**: See [docs/FIGMA_QUICK_START.md](docs/FIGMA_QUICK_START.md)
- **Features**:
  - Read Figma designs directly in Claude Code
  - Generate React Native code from designs
  - Extract design tokens (colors, fonts, spacing)
  - Compare implementation with designs
  - Document design systems

### 2. **Pencil** ✏️
- **Purpose**: Design system management and UI generation
- **Status**: Pre-configured and ready to use
- **Features**:
  - Create and edit `.pen` design files
  - Generate UI components from designs
  - Manage design systems
  - Validate design implementations

### 3. **Filesystem** 📁
- **Purpose**: Enhanced file system access
- **Status**: Pre-configured for `D:\ALMA` directory
- **Features**:
  - Safe file operations
  - Batch file processing
  - Directory traversal

## 🚀 Quick Setup

### Figma MCP Setup

1. **Get your Figma token**:
   - Go to https://www.figma.com/settings
   - Generate a Personal Access Token
   - Copy the token

2. **Run the setup script**:
   ```powershell
   # Windows
   .\scripts\setup-figma-mcp.ps1

   # Or Mac/Linux
   bash scripts/setup-figma-mcp.sh
   ```

3. **Restart Claude Code**

4. **Start using it**:
   ```
   "Read the Figma design and show me the home screen structure"
   ```

**Full guide**: [docs/FIGMA_MCP_SETUP.md](docs/FIGMA_MCP_SETUP.md)

## 💡 Usage Examples

### Design → Code Workflow
```markdown
"Look at the ProductCard component in Figma and generate a React Native component with proper styling"
```

### Design Token Extraction
```markdown
"Extract all design tokens from the Figma file and update our theme constants"
```

### Implementation Audit
```markdown
"Compare the current home screen implementation with the Figma design and list differences"
```

### Component Documentation
```markdown
"Analyze the Figma components and create documentation for our design system"
```

## 📁 MCP Configuration

Configuration files are in `.claude/`:

- **`mcp_settings.json`** - MCP server configurations
- **`settings.local.json`** - Local permissions and settings

### Adding New MCP Servers

Edit `.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "your-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-your-package"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

## 🔧 Troubleshooting

### MCP Server Not Starting

1. **Check Node.js is installed**:
   ```bash
   node --version
   ```

2. **Verify configuration**:
   ```bash
   cat .claude/mcp_settings.json
   ```

3. **Check Claude Code logs**:
   - View → Developer → Show Logs

### Figma Connection Issues

1. **Token expired**: Generate a new token from Figma settings
2. **Invalid file key**: Check the URL for correct file key
3. **No access**: Ensure your Figma account has access to the file

### Permissions Issues

1. Check `.claude/settings.local.json`
2. Ensure required permissions are listed
3. Restart Claude Code after changes

## 📚 Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Figma API Docs](https://www.figma.com/developers/api)
- [Claude Code Docs](https://code.anthropic.com/docs)
- [Figma MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/figma)

## 🛠️ Development Workflow

### Typical Design → Code Flow

1. **Designer** creates/updates design in Figma
2. **Developer** asks Claude to read Figma file
3. **Claude** generates React Native code
4. **Developer** reviews and integrates code
5. **Claude** validates implementation against design

### Example Session

```markdown
User: "Read the Figma file for the checkout screen"
Claude: [Reads file, shows structure]

User: "Generate the checkout form component"
Claude: [Generates React Native code]

User: "Compare with our current implementation"
Claude: [Lists differences and suggestions]

User: "Update the implementation to match the design"
Claude: [Updates code with proper styling]
```

## 🔐 Security

- ✅ All tokens stored in `.env` (gitignored)
- ✅ Local MCP configuration only
- ✅ No external API calls without permission
- ✅ Scoped access to file system

## 🎯 Best Practices

1. **Commit before generating**: Create a git commit before AI-generated code
2. **Review generated code**: Always review and test AI-generated code
3. **Use descriptive prompts**: Be specific about what you want
4. **Iterate gradually**: Start with small components, build up
5. **Version control designs**: Tag Figma versions for reference
6. **Document decisions**: Note why certain design choices were made

## 📊 MCP Server Status

| Server | Status | Configuration Required |
|--------|--------|----------------------|
| Figma | 🔧 Setup Required | Token + File Key |
| Pencil | ✅ Ready to Use | None |
| Filesystem | ✅ Ready to Use | None |

## 🤝 Contributing

When adding new MCP servers:

1. Update `.claude/mcp_settings.json`
2. Add setup documentation to `docs/`
3. Update this README with usage examples
4. Test the integration thoroughly

---

**Happy building! 🚀**

For detailed Figma setup, see [docs/FIGMA_QUICK_START.md](docs/FIGMA_QUICK_START.md)
