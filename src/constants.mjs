export const PLUGIN_NAME = "tribex-crm";
export const PLUGIN_VERSION = "0.1.1";
export const TOOL_PREFIX = "tribex_crm__";
export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = Number.parseInt(process.env.TRIBEX_CRM_PLUGIN_PORT || "4886", 10);
export const DEFAULT_CRM_API_BASE = process.env.TRIBEX_CRM_API_BASE || "https://crm.tribexai.com";
export const DEFAULT_RENDERER_API_BASE =
  process.env.TRIBEX_CRM_RENDERER_API_BASE || `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;
export const TRUSTED_HEADER_SECRET = process.env.TRIBEX_CRM_TRUSTED_HEADER_SECRET || "";
