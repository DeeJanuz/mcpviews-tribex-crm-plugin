# MCPViews TribeX CRM Plugin

Standalone MCPViews plugin for the TribeX CRM service. It provides:

- `tribex_crm` renderer for accounts, contacts, opportunities, stages, and audience handoff.
- Local MCP bridge on `http://127.0.0.1:4886/mcp`.
- Proxy tools for the CRM service API and a local audience row normalizer.

## Local Development

```bash
npm test
npm run check
npm start
```

By default the plugin bridge points at `http://127.0.0.1:3012`. Override with:

```bash
TRIBEX_CRM_API_BASE=http://127.0.0.1:3012 npm start
```

For local authenticated calls, provide either tool arguments or environment variables:

- `organization_id` / `TRIBEX_CRM_ORGANIZATION_ID`
- `user_id` / `TRIBEX_CRM_USER_ID`

## Renderer

The `tribex_crm` renderer expects:

```json
{
  "api_base": "http://127.0.0.1:3012",
  "organization_id": "org_...",
  "user_id": "user_...",
  "initial_tab": "accounts"
}
```
