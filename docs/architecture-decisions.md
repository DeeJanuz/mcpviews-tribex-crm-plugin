# Architecture Decisions

## 2026-05-19: Plugin-First CRM Workspace

The first operational CRM surface is a standalone MCPViews renderer. This keeps CRM close to the existing TribeX tools while the dedicated service owns persistence, auth, API, and MCP contracts.

## 2026-05-19: Thin Local Bridge

The local plugin MCP bridge does not store CRM records. It opens the renderer, normalizes audience rows, and proxies record operations to the `tribex-crm` service API.

## 2026-05-19: Inline Audience Handoff

Audience handoff remains inline JSON rows in v1. Durable audience artifacts can be added later if campaign workflows need saved lists or audit snapshots.
