import http from "node:http";
import {
  DEFAULT_CRM_API_BASE,
  DEFAULT_HOST,
  DEFAULT_PORT,
  PLUGIN_NAME,
  PLUGIN_VERSION,
  TOOL_PREFIX,
} from "./constants.mjs";
import { normalizeAudienceRows } from "./audience-rows.mjs";

const CRM_TOOL_DEFINITIONS = [
  "list_accounts",
  "create_account",
  "update_account",
  "archive_account",
  "list_contacts",
  "create_contact",
  "update_contact",
  "archive_contact",
  "list_opportunities",
  "create_opportunity",
  "update_opportunity",
  "archive_opportunity",
  "list_pipeline_stages",
  "create_pipeline_stage",
  "reorder_pipeline_stages",
  "export_audience",
].map((name) => ({
  name,
  description: `Proxy ${name} to the TribeX CRM service API.`,
  inputSchema: {
    type: "object",
    additionalProperties: true,
    properties: {
      api_base: { type: "string" },
      organization_id: { type: "string" },
      user_id: { type: "string" },
    },
  },
}));

export const TOOL_DEFINITIONS = [
  {
    name: "tribex-crm-open",
    description: "Return a payload for opening the standalone TribeX CRM renderer.",
    inputSchema: {
      type: "object",
      additionalProperties: true,
      properties: {
        api_base: { type: "string" },
        organization_id: { type: "string" },
        user_id: { type: "string" },
        initial_tab: {
          type: "string",
          enum: ["accounts", "contacts", "opportunities", "stages", "audience"],
        },
        audience: { type: "array", items: { type: "object" } },
      },
    },
  },
  {
    name: "tribex-crm-audience-normalize",
    description: "Normalize CRM audience rows for TribeX email campaign tools.",
    inputSchema: {
      type: "object",
      additionalProperties: true,
      properties: {
        rows: { type: "array", items: { type: "object" } },
      },
      required: ["rows"],
    },
  },
  ...CRM_TOOL_DEFINITIONS,
];

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function jsonRpcError(id, code, message, data) {
  return {
    jsonrpc: "2.0",
    id,
    error: data ? { code, message, data } : { code, message },
  };
}

function toolResult(payload) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text.trim() ? JSON.parse(text) : {};
}

function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    ...extraHeaders,
  });
  response.end(JSON.stringify(body));
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, mcp-session-id");
}

function normalizeToolName(name) {
  return String(name || "").replace(new RegExp(`^${TOOL_PREFIX}`), "");
}

function rendererPayload(args = {}) {
  return {
    renderer: "tribex_crm",
    api_base: args.api_base || args.apiBase || DEFAULT_CRM_API_BASE,
    organization_id: args.organization_id || args.organizationId || process.env.TRIBEX_CRM_ORGANIZATION_ID || "",
    user_id: args.user_id || args.userId || process.env.TRIBEX_CRM_USER_ID || "",
    initial_tab: args.initial_tab || args.initialTab || "accounts",
    audience: Array.isArray(args.audience) ? args.audience : [],
  };
}

function authHeaders(args = {}) {
  const organizationId = args.organization_id || args.organizationId || process.env.TRIBEX_CRM_ORGANIZATION_ID;
  const userId = args.user_id || args.userId || process.env.TRIBEX_CRM_USER_ID;
  const headers = {
    "Content-Type": "application/json",
  };
  if (organizationId) headers["x-tribex-organization-id"] = organizationId;
  if (userId) headers["x-tribex-user-id"] = userId;
  if (args.authorization) headers.Authorization = args.authorization;
  return headers;
}

function query(params) {
  const out = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    out.set(key, String(value));
  }
  const text = out.toString();
  return text ? `?${text}` : "";
}

function requireId(toolName, args) {
  if (!toolName.startsWith("update_") && !toolName.startsWith("archive_")) return undefined;
  if (args.id === undefined || args.id === null || String(args.id).trim() === "") {
    throw new Error(`${toolName} requires id`);
  }
  return encodeURIComponent(String(args.id).trim());
}

function apiRouteFor(toolName, args) {
  const id = requireId(toolName, args);
  const routes = {
    list_accounts: ["GET", `/api/accounts${query({ search: args.search, ownerId: args.owner_id, includeArchived: args.include_archived })}`],
    create_account: ["POST", "/api/accounts"],
    update_account: ["PATCH", `/api/accounts/${id}`],
    archive_account: ["DELETE", `/api/accounts/${id}`],
    list_contacts: ["GET", `/api/contacts${query({ accountId: args.account_id, search: args.search, ownerId: args.owner_id, includeArchived: args.include_archived })}`],
    create_contact: ["POST", "/api/contacts"],
    update_contact: ["PATCH", `/api/contacts/${id}`],
    archive_contact: ["DELETE", `/api/contacts/${id}`],
    list_opportunities: ["GET", `/api/opportunities${query({ accountId: args.account_id, stageId: args.stage_id, search: args.search, ownerId: args.owner_id, includeArchived: args.include_archived })}`],
    create_opportunity: ["POST", "/api/opportunities"],
    update_opportunity: ["PATCH", `/api/opportunities/${id}`],
    archive_opportunity: ["DELETE", `/api/opportunities/${id}`],
    list_pipeline_stages: ["GET", "/api/pipeline-stages"],
    create_pipeline_stage: ["POST", "/api/pipeline-stages"],
    reorder_pipeline_stages: ["PUT", "/api/pipeline-stages"],
    export_audience: ["POST", "/api/audience-export"],
  };
  return routes[toolName];
}

function bodyFor(toolName, args) {
  const body = {};
  const mapping = {
    name: "name",
    owner_id: "ownerId",
    domain: "domain",
    website: "website",
    industry: "industry",
    account_id: "accountId",
    first_name: "firstName",
    last_name: "lastName",
    display_name: "displayName",
    email: "email",
    phone: "phone",
    title: "title",
    source: "source",
    email_opt_out: "emailOptOut",
    primary_contact_id: "primaryContactId",
    stage_id: "stageId",
    amount_cents: "amountCents",
    currency: "currency",
    expected_close_date: "expectedCloseDate",
    description: "description",
    category: "category",
    probability: "probability",
    sort_order: "sortOrder",
    ordered_stage_ids: "orderedStageIds",
    opportunity_stage_ids: "opportunityStageIds",
    opportunity_stage_categories: "opportunityStageCategories",
    include_archived: "includeArchived",
    include_opted_out: "includeOptedOut",
    search: "search",
  };
  for (const [source, target] of Object.entries(mapping)) {
    if (args[source] !== undefined) body[target] = args[source];
  }
  if (toolName.startsWith("list_") || toolName.startsWith("archive_")) return undefined;
  return body;
}

async function proxyCrmTool(toolName, args = {}) {
  const route = apiRouteFor(toolName, args);
  if (!route) throw new Error(`Unknown CRM proxy tool: ${toolName}`);
  const [method, path] = route;
  const apiBase = String(args.api_base || args.apiBase || DEFAULT_CRM_API_BASE).replace(/\/$/, "");
  const body = bodyFor(toolName, args);
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: authHeaders(args),
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: response.status,
      error: payload.error || payload,
    };
  }
  return payload;
}

export async function handleToolCall(name, args = {}) {
  const toolName = normalizeToolName(name);
  if (toolName === "tribex-crm-open") return toolResult(rendererPayload(args));
  if (toolName === "tribex-crm-audience-normalize") return toolResult(normalizeAudienceRows(args.rows));
  if (CRM_TOOL_DEFINITIONS.some((tool) => tool.name === toolName)) {
    return toolResult(await proxyCrmTool(toolName, args));
  }
  throw new Error(`Unknown tool: ${name}`);
}

async function handleJsonRpc(requestBody) {
  if (requestBody.method === "initialize") {
    return jsonRpcResult(requestBody.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: PLUGIN_NAME, version: PLUGIN_VERSION },
    });
  }

  if (requestBody.method === "tools/list") {
    return jsonRpcResult(requestBody.id, { tools: TOOL_DEFINITIONS });
  }

  if (requestBody.method === "tools/call") {
    try {
      const result = await handleToolCall(requestBody.params?.name, requestBody.params?.arguments || {});
      return jsonRpcResult(requestBody.id, result);
    } catch (error) {
      return jsonRpcError(requestBody.id, -32603, error.message);
    }
  }

  return jsonRpcError(requestBody.id, -32601, `Unsupported method: ${requestBody.method}`);
}

export function createServer() {
  return http.createServer(async (request, response) => {
    setCors(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { ok: true, plugin: PLUGIN_NAME, version: PLUGIN_VERSION });
      return;
    }

    if (request.method !== "POST" || request.url !== "/mcp") {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    try {
      const body = await readJson(request);
      sendJson(response, 200, await handleJsonRpc(body));
    } catch (error) {
      sendJson(response, 500, jsonRpcError(null, -32603, error.message));
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(DEFAULT_PORT, DEFAULT_HOST, () => {
    console.log(`[${PLUGIN_NAME}] MCP server listening at http://${DEFAULT_HOST}:${DEFAULT_PORT}/mcp`);
  });
}
