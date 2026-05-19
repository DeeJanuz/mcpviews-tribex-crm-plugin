import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("manifest registers TribeX CRM renderer and MCP prefix", async () => {
  const manifest = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url), "utf8"));

  assert.equal(manifest.name, "tribex-crm");
  assert.equal(manifest.mcp.tool_prefix, "tribex_crm__");
  assert.equal(manifest.renderers["tribex-crm-open"], "tribex_crm");
  assert.ok(manifest.renderer_definitions.some((renderer) => renderer.name === "tribex_crm"));
  assert.ok(manifest.registry_index.tool_groups.some((group) => group.name === "Records"));
});
