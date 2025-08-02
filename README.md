# Polish NIP Checker MCP Server

A Model Context Protocol (MCP) server for checking Polish NIP (Tax Identification Numbers) using the official Ministry of Finance VAT taxpayer database.

## Features

- ✅ **Real-time NIP verification** using official Polish Ministry of Finance API
- ✅ **Bank account verification** - check if bank account belongs to specific NIP
- ✅ **Automatic date handling** - defaults to current date
- ✅ **Input normalization** - handles NIP formats with or without hyphens
- ✅ **Comprehensive error handling** and validation
- ✅ **Ready for Claude Desktop** - works seamlessly with AI assistants

## Quick Start with npx (Recommended)

Add this to your Claude Desktop configuration:

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

## Installation Options

### Option 1: Direct npx usage (No installation needed)
```bash
npx @solverio/nip-checker-mcp@latest
```

### Option 2: Global installation
```bash
npm install -g @solverio/nip-checker-mcp
nip-checker-mcp
```

### Option 3: Local development
```bash
git clone https://github.com/solverio/nip-checker-mcp.git
cd nip-checker-mcp
npm install
npm run build
npm start
```

## Available Tools

### `check_nip`
Verify Polish NIP in the VAT taxpayer database.

**Parameters:**
- `nip` (required): Polish NIP number (10 digits, hyphens optional)
- `date` (optional): Date for verification (YYYY-MM-DD format, defaults to today)

**Example:**
```
Check NIP 9491626103
```

### `check_nip_bank_account`
Verify if a bank account is assigned to a specific NIP.

**Parameters:**
- `nip` (required): Polish NIP number (10 digits)
- `bankAccount` (required): Bank account number (26 digits)
- `date` (optional): Date for verification (YYYY-MM-DD format)

**Example:**
```
Verify if account 38109017950000000151316514 belongs to NIP 9491626103
```

## Sample Output

```
✅ NIP Verification Results

**NIP**: 9491626103
**Company**: JANUSZ CHALIMONIUK
**VAT Status**: Czynny (Active)
**Address**: BURSZTYNOWA 73D, 42-202 CZĘSTOCHOWA
**Registration Date**: 2022-09-01
**Bank Accounts**: 38109017950000000151316514
**REGON**: 240070517
**Virtual Accounts**: No

**Request Details**:
- Request ID: rLtV8-9471ak2
- Query Date: 02-08-2025 09:29:38
```

## Claude Desktop Configuration

### Windows
Edit: `%APPDATA%\Claude\claude_desktop_config.json`

### macOS
Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Full configuration example:
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

## Personal Settings Addition

Add this simple line to your Claude personal settings for automatic usage:

```
NIP Checker: When user asks to check/verify/lookup a Polish NIP number, use the check_nip MCP tool automatically.
```

## Usage Examples

Once configured, you can simply ask:

- `"check nip 9491626103"`
- `"verify nip 123-456-78-90"`
- `"lookup nip 9491626103 for yesterday"`
- `"is account 38109017950000000151316514 assigned to nip 9491626103?"`

## API Source

This tool uses the official Polish Ministry of Finance API:
- **Base URL**: `https://wl-api.mf.gov.pl/`
- **Documentation**: Available at the API endpoint
- **Data Source**: Official VAT taxpayer registry ("Biała Lista Podatników")

## Requirements

- Node.js 18.0.0 or higher
- Internet connection for API access

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/solverio/nip-checker-mcp/issues) page.

---

**Made with ❤️ by [Solverio](https://solverio.pl/) for the Polish business community.**