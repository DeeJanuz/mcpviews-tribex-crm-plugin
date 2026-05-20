import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("CRM renderer follows the email plugin operational shell pattern", async () => {
  const source = await readFile(new URL("../renderers/tribex-crm.js", import.meta.url), "utf8");

  assert.match(source, /window\.__renderers\.tribex_crm/);
  assert.match(source, /txcrm-status-card/);
  assert.match(source, /txcrm-tabs/);
  assert.match(source, /txcrm-panel-header/);
  assert.match(source, /txcrm-grid-wrap/);
  assert.match(source, /txcrm-metrics/);
  assert.match(source, /txcrm-detail/);
  assert.match(source, /txcrm-pipeline/);
  assert.doesNotMatch(source, /txcrm-side/);
});

test("CRM renderer does not expose technical connection controls", async () => {
  const source = await readFile(new URL("../renderers/tribex-crm.js", import.meta.url), "utf8");

  assert.doesNotMatch(source, /Service Context/);
  assert.doesNotMatch(source, /data-role="api-base"/);
  assert.doesNotMatch(source, /data-role="org"/);
  assert.doesNotMatch(source, /data-role="user"/);
});

test("CRM renderer resolves bridge config from MCPViews without credentialed CORS", async () => {
  const source = await readFile(new URL("../renderers/tribex-crm.js", import.meta.url), "utf8");

  assert.match(source, /__mcpviews_plugins/);
  assert.match(source, /"tribex-crm"/);
  assert.doesNotMatch(source, /credentials:\s*"include"/);
});
