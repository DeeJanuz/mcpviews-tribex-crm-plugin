# MCPViews TribeX CRM Plugin

Standalone MCPViews plugin for the TribeX CRM service. It provides:

- `tribex_crm` renderer for accounts, contacts, opportunities, stages, and audience handoff.
- Local MCP bridge on `http://127.0.0.1:4886/mcp`.
- Proxy tools for the CRM service API and a local audience row normalizer.
- A user-facing CRM workspace that keeps API, organization, user, and secret fields out of the renderer UI.

## Local Development

```bash
npm test
npm run check
npm run package
npm start
```

By default the plugin bridge points at the deployed CRM service, `https://crm.tribexai.com`. Override for local CRM service development with:

```bash
TRIBEX_CRM_API_BASE=http://127.0.0.1:3012 npm start
```

For local authenticated calls, configure environment variables for the bridge:

- `TRIBEX_CRM_ORGANIZATION_ID`
- `TRIBEX_CRM_USER_ID`

## Renderer

The `tribex_crm` renderer can be opened with only business context:

```json
{
  "initial_tab": "accounts"
}
```

Connection details are supplied by MCPViews and the local bridge. They should not be shown as editable fields in the CRM workspace.

## Release

The MCPViews registry reads `manifest.json` from this repository and installs the packaged renderer assets from the release ZIP:

```bash
npm run check
npm test
npm run package
gh release create 0.1.1 dist/tribex-crm.zip --title 0.1.1 --notes "Default the CRM bridge to the deployed crm.tribexai.com service."
```
