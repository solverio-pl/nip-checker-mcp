# Setup Instructions for Publishing to NPM

## 1. Initialize Git Repository

```bash
cd "D:\!! Moje\Solverio\projekty\MCP\nip-checker"
git init
git add .
git commit -m "Initial commit - Polish NIP Checker MCP Server"
```

## 2. Create GitHub Repository

1. Go to GitHub and create a new repository: `nip-checker-mcp`
2. Don't initialize with README (we already have one)

## 3. Connect to GitHub

```bash
git remote add origin https://github.com/yourusername/nip-checker-mcp.git
git branch -M main
git push -u origin main
```

## 4. Setup NPM Account

1. Create account at https://www.npmjs.com/
2. Generate access token: Profile → Access Tokens → Generate New Token (Classic)
3. Select "Automation" type for GitHub Actions

## 5. Configure GitHub Secrets

In your GitHub repository:
1. Go to Settings → Secrets and variables → Actions
2. Add new secret: `NPM_TOKEN` with your NPM access token

## 6. Publish to NPM

### Option A: Manual publish
```bash
npm login
npm publish --access public
```

### Option B: Automatic via GitHub (Recommended)
```bash
git tag v1.0.0
git push origin v1.0.0
```

## 7. Usage Configuration

Once published, users can add this to their Claude Desktop config:

```json
{
  "mcpServers": {
    "nip-checker": {
      "command": "npx",
      "args": ["-y", "@solverio/nip-checker-mcp@latest"]
    }
  }
}
```

## 8. Test Installation

```bash
# Test global installation
npm install -g @solverio/nip-checker-mcp

# Test npx usage
npx @solverio/nip-checker-mcp@latest
```

## Package Name

The package will be published as: `@solverio/nip-checker-mcp`

Make sure to:
1. Change the package name in package.json if needed
2. Update GitHub repository URLs in package.json
3. Set up NPM organization if using scoped packages (@solverio/)