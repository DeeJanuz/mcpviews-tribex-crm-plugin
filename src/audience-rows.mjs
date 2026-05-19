function firstString(values, fallback = "") {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function normalizeAudienceRow(row) {
  if (!isRecord(row)) return null;
  const email = firstString([row.email, row.emailAddress, row.email_address]);
  if (!email) return null;

  const firstName = firstString([row.firstName, row.first_name]);
  const lastName = firstString([row.lastName, row.last_name]);
  const displayName = firstString([
    row.displayName,
    row.display_name,
    `${firstName} ${lastName}`.trim(),
    email,
  ]);
  const accountName = firstString([row.accountName, row.account_name, row.company]);

  return {
    ...row,
    email,
    emailAddress: email,
    email_address: email,
    firstName,
    lastName,
    displayName,
    company: accountName || undefined,
    accountName: accountName || undefined,
  };
}

export function normalizeAudienceRows(rows) {
  const input = Array.isArray(rows) ? rows : [];
  const normalized = [];
  const seen = new Set();
  let skippedMissingEmail = 0;

  for (const row of input) {
    const next = normalizeAudienceRow(row);
    if (!next) {
      skippedMissingEmail += 1;
      continue;
    }
    const key = next.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(next);
  }

  return {
    rows: normalized,
    meta: {
      inputRows: input.length,
      outputRows: normalized.length,
      skippedMissingEmail,
      duplicateEmails: input.length - skippedMissingEmail - normalized.length,
    },
  };
}
