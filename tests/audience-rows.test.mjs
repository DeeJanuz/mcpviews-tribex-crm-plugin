import assert from "node:assert/strict";
import test from "node:test";
import { normalizeAudienceRows } from "../src/audience-rows.mjs";

test("normalizeAudienceRows maps CRM rows to email audience shape", () => {
  const result = normalizeAudienceRows([
    {
      emailAddress: "Ada@Example.com",
      first_name: "Ada",
      last_name: "Lovelace",
      company: "Acme",
    },
    {
      email_address: "ada@example.com",
      displayName: "Duplicate",
    },
    {
      displayName: "No Email",
    },
  ]);

  assert.equal(result.rows.length, 1);
  assert.deepEqual(result.meta, {
    inputRows: 3,
    outputRows: 1,
    skippedMissingEmail: 1,
    duplicateEmails: 1,
  });
  assert.equal(result.rows[0].email, "Ada@Example.com");
  assert.equal(result.rows[0].emailAddress, "Ada@Example.com");
  assert.equal(result.rows[0].email_address, "Ada@Example.com");
  assert.equal(result.rows[0].displayName, "Ada Lovelace");
});
