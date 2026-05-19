import assert from "node:assert/strict";
import test from "node:test";
import { handleToolCall, TOOL_DEFINITIONS } from "../src/server.mjs";

function parseToolResult(result) {
  return JSON.parse(result.content[0].text);
}

test("TOOL_DEFINITIONS exposes renderer and CRM bridge tools", () => {
  const names = TOOL_DEFINITIONS.map((tool) => tool.name);

  assert.ok(names.includes("tribex-crm-open"));
  assert.ok(names.includes("list_accounts"));
  assert.ok(names.includes("export_audience"));
});

test("handleToolCall returns renderer payload", async () => {
  const payload = parseToolResult(
    await handleToolCall("tribex_crm__tribex-crm-open", {
      api_base: "http://crm.local",
      organization_id: "org_1",
      user_id: "user_1",
      initial_tab: "contacts",
    })
  );

  assert.equal(payload.renderer, "tribex_crm");
  assert.equal(payload.api_base, "http://crm.local");
  assert.equal(payload.organization_id, "org_1");
  assert.equal(payload.initial_tab, "contacts");
});

test("handleToolCall normalizes audience rows", async () => {
  const payload = parseToolResult(
    await handleToolCall("tribex-crm-audience-normalize", {
      rows: [{ email: "ada@example.com", displayName: "Ada" }],
    })
  );

  assert.equal(payload.rows[0].emailAddress, "ada@example.com");
  assert.equal(payload.meta.outputRows, 1);
});
