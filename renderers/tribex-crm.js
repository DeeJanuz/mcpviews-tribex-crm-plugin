(function() {
  "use strict";

  window.__renderers = window.__renderers || {};

  var DEFAULT_BRIDGE_BASE = "http://127.0.0.1:4886";
  var styleInjected = false;
  var tabs = ["accounts", "contacts", "opportunities", "stages", "audience"];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function firstString(values, fallback) {
    for (var index = 0; index < values.length; index += 1) {
      if (typeof values[index] === "string" && values[index].trim()) return values[index].trim();
    }
    return fallback || "";
  }

  function bridgeBaseFromPluginConfig() {
    var config = window.__mcpviews_plugins && window.__mcpviews_plugins["tribex-crm"];
    var mcpUrl = config && typeof config.mcp_url === "string" ? config.mcp_url.trim() : "";
    if (!mcpUrl) return DEFAULT_BRIDGE_BASE;
    return mcpUrl.replace(/\/mcp\/?$/, "").replace(/\/$/, "");
  }

  function injectStyles() {
    if (styleInjected) return;
    styleInjected = true;
    var selectChevronDark = 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%239ca3af%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E")';
    var selectChevronLight = 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E")';
    var style = document.createElement("style");
    style.textContent = [
      ".txcrm-root{--glass-bg:rgba(255,255,255,0.06);--glass-bg-heavy:rgba(255,255,255,0.10);--glass-border:rgba(255,255,255,0.10);--glass-blur:12px;--glass-shadow:0 8px 32px rgba(0,0,0,0.40);--glass-inset-highlight:inset 0 1px 0 rgba(255,255,255,0.06);--bg-app:#0f1117;--bg-surface:rgba(255,255,255,0.05);--bg-surface-hover:rgba(255,255,255,0.08);--bg-surface-subtle:rgba(255,255,255,0.03);--text-primary:rgba(255,255,255,0.95);--text-secondary:rgba(255,255,255,0.62);--text-tertiary:rgba(255,255,255,0.38);--accent-primary:#818cf8;--accent-primary-hover:#6366f1;--accent-primary-ghost:rgba(129,140,248,0.12);--border-default:rgba(255,255,255,0.08);--border-subtle:rgba(255,255,255,0.04);--border-strong:rgba(255,255,255,0.15);--color-warning-bg:rgba(245,158,11,0.14);--color-warning-text:#fcd34d;--color-error-bg:rgba(239,68,68,0.15);--color-error-text:#fca5a5;--color-success-bg:rgba(34,197,94,0.15);--color-success-text:#86efac;--color-info-bg:rgba(96,165,250,0.14);--color-info-text:#93c5fd;--font-sans:Figtree,Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;--font-mono:'SF Mono','Fira Code','Cascadia Code',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;--text-h1:24px;--text-h3:16px;--text-body:14px;--text-small:12px;--text-xs:11px;--weight-semibold:600;--weight-bold:700;--space-1:4px;--space-2:8px;--space-3:12px;--space-4:16px;--space-6:24px;--radius-md:8px;--radius-lg:12px;--radius-pill:999px;--transition-fast:0.15s ease;box-sizing:border-box;min-height:100%;padding:var(--space-6) var(--space-4);color:var(--text-primary);background:radial-gradient(circle at top left,rgba(129,140,248,0.18),transparent 34%),linear-gradient(180deg,#0b1020 0%,#0f1117 55%,#111827 100%);font:var(--text-body)/1.45 var(--font-sans);}",
      ".txcrm-root *{box-sizing:border-box;}",
      ".txcrm-root h2,.txcrm-root h3,.txcrm-root p{margin:0;}",
      ".txcrm-shell{max-width:1280px;margin:0 auto;display:grid;gap:var(--space-4);}",
      ".txcrm-top{display:flex;justify-content:space-between;gap:var(--space-4);align-items:flex-start;}",
      ".txcrm-kicker{color:var(--text-tertiary);font-size:var(--text-xs);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:0;margin-bottom:4px;}",
      ".txcrm-title h2{font-size:var(--text-h1);line-height:1.2;font-weight:var(--weight-bold);color:var(--text-primary);letter-spacing:0;}",
      ".txcrm-title p{margin-top:4px;color:var(--text-secondary);font-size:var(--text-small);max-width:720px;}",
      ".txcrm-status-card{min-width:240px;border:1px solid var(--glass-border);background:var(--glass-bg);border-radius:var(--radius-lg);padding:var(--space-3);color:var(--text-secondary);box-shadow:var(--glass-shadow),var(--glass-inset-highlight);backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));}",
      ".txcrm-status-card strong{display:block;color:var(--text-primary);font-weight:var(--weight-semibold);}",
      ".txcrm-status-card span{display:block;margin-top:3px;font-size:var(--text-xs);line-height:1.35;color:var(--text-tertiary);}",
      ".txcrm-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3);}",
      ".txcrm-metric{border:1px solid var(--border-subtle);background:var(--bg-surface);border-radius:var(--radius-md);padding:var(--space-3);min-width:0;}",
      ".txcrm-metric span{display:block;color:var(--text-secondary);font-size:var(--text-xs);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:0;margin-bottom:4px;}",
      ".txcrm-metric strong{display:block;font-size:var(--text-h1);line-height:1.1;font-weight:var(--weight-bold);color:var(--accent-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-metric em{display:block;margin-top:3px;color:var(--text-tertiary);font-size:var(--text-xs);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-tabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--space-2);border:1px solid var(--border-default);background:var(--bg-surface-subtle);border-radius:var(--radius-lg);padding:var(--space-2);}",
      ".txcrm-tab{min-height:54px;border:1px solid transparent;background:transparent;color:var(--text-secondary);border-radius:var(--radius-md);padding:8px 10px;text-align:left;font:inherit;cursor:pointer;transition:border-color var(--transition-fast),background var(--transition-fast),color var(--transition-fast);}",
      ".txcrm-tab:hover{border-color:var(--border-default);background:var(--bg-surface);color:var(--text-primary);}",
      ".txcrm-tab[aria-selected=true]{border-color:rgba(129,140,248,.42);background:var(--accent-primary-ghost);color:var(--text-primary);}",
      ".txcrm-tab span{display:block;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-tertiary);}",
      ".txcrm-tab strong{display:block;margin-top:2px;font-size:var(--text-small);line-height:1.2;font-weight:var(--weight-semibold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-main{display:grid;gap:var(--space-4);}",
      ".txcrm-workspace{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,390px);gap:var(--space-4);align-items:start;}",
      ".txcrm-panel{background:var(--glass-bg);backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));border:1px solid var(--glass-border);border-radius:var(--radius-lg);box-shadow:var(--glass-shadow),var(--glass-inset-highlight);overflow:hidden;}",
      ".txcrm-panel-header{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);padding:var(--space-4);border-bottom:1px solid var(--border-default);background:var(--bg-surface-subtle);}",
      ".txcrm-panel-title{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-h3);font-weight:var(--weight-semibold);color:var(--text-primary);}",
      ".txcrm-panel-title::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--accent-primary);box-shadow:0 0 0 3px rgba(129,140,248,0.12);}",
      ".txcrm-section-kicker{font-size:var(--text-xs);color:var(--text-tertiary);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:0;margin-bottom:3px;}",
      ".txcrm-small{font-size:var(--text-small);color:var(--text-tertiary);line-height:1.45;margin-top:4px;}",
      ".txcrm-label{font-size:var(--text-xs);text-transform:uppercase;color:var(--text-secondary);font-weight:var(--weight-semibold);margin-bottom:4px;letter-spacing:0;}",
      ".txcrm-input,.txcrm-select,.txcrm-textarea{width:100%;min-height:38px;box-sizing:border-box;border:1px solid var(--border-default);background:var(--bg-surface);color:var(--text-primary);border-radius:var(--radius-md);padding:8px 10px;font:inherit;font-size:13px;outline:none;transition:border-color var(--transition-fast),background-color var(--transition-fast);}",
      ".txcrm-textarea{min-height:88px;resize:vertical;}",
      ".txcrm-select{appearance:none;-webkit-appearance:none;color-scheme:dark;background-color:var(--bg-surface);background-image:" + selectChevronDark + ";background-repeat:no-repeat;background-position:right 11px center;background-size:14px 14px;padding-right:34px;}",
      ".txcrm-input:focus,.txcrm-select:focus,.txcrm-textarea:focus{border-color:var(--accent-primary);background-color:var(--bg-surface-hover);}",
      ".txcrm-input::placeholder,.txcrm-textarea::placeholder{color:var(--text-tertiary);}",
      ".txcrm-toolbar{display:grid;grid-template-columns:minmax(180px,300px) minmax(160px,220px) 1fr;align-items:end;gap:var(--space-2);padding:var(--space-4);border-bottom:1px solid var(--border-default);}",
      ".txcrm-actions{display:flex;gap:var(--space-2);align-items:center;justify-content:flex-end;flex-wrap:wrap;}",
      ".txcrm-button{min-height:38px;border:1px solid var(--border-default);background:var(--bg-surface);color:var(--text-primary);border-radius:var(--radius-md);padding:0 14px;font-weight:var(--weight-semibold);font-size:var(--text-small);font-family:inherit;cursor:pointer;white-space:nowrap;transition:border-color var(--transition-fast),background var(--transition-fast),color var(--transition-fast),transform var(--transition-fast);}",
      ".txcrm-button:hover{border-color:var(--border-strong);background:var(--bg-surface-hover);}",
      ".txcrm-button:active{transform:scale(.98);}",
      ".txcrm-button.primary{background:var(--accent-primary);border-color:var(--accent-primary);color:#fff;}",
      ".txcrm-button.primary:hover{background:var(--accent-primary-hover);border-color:var(--accent-primary-hover);}",
      ".txcrm-button.danger{background:var(--color-error-bg);border-color:rgba(239,68,68,.28);color:var(--color-error-text);}",
      ".txcrm-button:disabled{opacity:.55;cursor:not-allowed;transform:none;}",
      ".txcrm-error{display:none;border:1px solid rgba(239,68,68,.28);background:var(--color-error-bg);color:var(--color-error-text);border-radius:var(--radius-md);padding:var(--space-3);font-size:var(--text-small);}",
      ".txcrm-error.visible{display:block;}",
      ".txcrm-form{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);padding:var(--space-4);align-items:end;}",
      ".txcrm-form label{min-width:0;}",
      ".txcrm-form .wide{grid-column:1/-1;}",
      ".txcrm-check{display:flex;gap:var(--space-2);align-items:center;min-height:38px;color:var(--text-secondary);font-size:var(--text-small);}",
      ".txcrm-check input{width:16px;height:16px;accent-color:var(--accent-primary);}",
      ".txcrm-detail-foot{display:flex;gap:var(--space-2);justify-content:space-between;align-items:center;padding:var(--space-4);border-top:1px solid var(--border-default);background:var(--bg-surface-subtle);}",
      ".txcrm-detail-actions{display:flex;gap:var(--space-2);flex-wrap:wrap;justify-content:flex-end;}",
      ".txcrm-grid-wrap{overflow:auto;}",
      ".txcrm-grid{width:100%;border-collapse:collapse;font-size:var(--text-small);table-layout:fixed;min-width:760px;}",
      ".txcrm-grid th{position:sticky;top:0;z-index:1;background:rgba(17,24,39,.96);color:var(--text-secondary);text-align:left;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:0;padding:9px 10px;border-bottom:1px solid var(--border-subtle);font-weight:var(--weight-semibold);}",
      ".txcrm-grid td{padding:9px 10px;border-bottom:1px solid var(--border-subtle);vertical-align:top;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-grid tr:last-child td{border-bottom:0;}",
      ".txcrm-grid tbody tr{cursor:pointer;}",
      ".txcrm-grid tbody tr:hover td{background:var(--bg-surface-hover);}",
      ".txcrm-grid tbody tr.active td{background:var(--accent-primary-ghost);}",
      ".txcrm-record-primary{display:grid;gap:2px;min-width:0;}",
      ".txcrm-record-primary strong{font-weight:var(--weight-bold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-record-primary span{color:var(--text-tertiary);font-size:var(--text-xs);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-empty{padding:var(--space-6);color:var(--text-tertiary);font-size:var(--text-small);text-align:center;}",
      ".txcrm-badge{display:inline-flex;align-items:center;min-height:22px;border-radius:var(--radius-pill);padding:2px 8px;font-size:var(--text-xs);font-weight:var(--weight-semibold);background:var(--accent-primary-ghost);border:1px solid rgba(129,140,248,.22);color:var(--text-primary);text-transform:capitalize;}",
      ".txcrm-badge.won{background:var(--color-success-bg);border-color:rgba(34,197,94,.28);color:var(--color-success-text);}",
      ".txcrm-badge.lost{background:var(--color-error-bg);border-color:rgba(239,68,68,.28);color:var(--color-error-text);}",
      ".txcrm-badge.warn{background:var(--color-warning-bg);border-color:rgba(245,158,11,.32);color:var(--color-warning-text);}",
      ".txcrm-badge.info{background:var(--color-info-bg);border-color:rgba(96,165,250,.32);color:var(--color-info-text);}",
      ".txcrm-pipeline{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-2);padding:var(--space-4);border-bottom:1px solid var(--border-default);background:var(--bg-surface-subtle);}",
      ".txcrm-stage-card{border:1px solid var(--border-default);background:var(--bg-surface);border-radius:var(--radius-md);padding:var(--space-3);text-align:left;color:var(--text-primary);font:inherit;cursor:pointer;min-width:0;transition:border-color var(--transition-fast),background var(--transition-fast);}",
      ".txcrm-stage-card:hover{border-color:var(--border-strong);background:var(--bg-surface-hover);}",
      ".txcrm-stage-card.active{border-color:rgba(129,140,248,.52);background:var(--accent-primary-ghost);}",
      ".txcrm-stage-card span{display:block;color:var(--text-tertiary);font-size:var(--text-xs);font-weight:var(--weight-semibold);text-transform:uppercase;letter-spacing:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-stage-card strong{display:block;margin-top:3px;font-size:var(--text-small);font-weight:var(--weight-bold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-stage-card em{display:block;margin-top:3px;color:var(--text-secondary);font-size:var(--text-xs);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-audience{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,340px);gap:var(--space-4);align-items:start;}",
      ".txcrm-audience-side{padding:var(--space-4);display:grid;gap:var(--space-3);}",
      ".txcrm-summary-list{display:grid;gap:var(--space-2);}",
      ".txcrm-summary-row{display:flex;justify-content:space-between;gap:var(--space-3);border-bottom:1px solid var(--border-subtle);padding-bottom:var(--space-2);color:var(--text-secondary);font-size:var(--text-small);}",
      ".txcrm-summary-row:last-child{border-bottom:0;padding-bottom:0;}",
      ".txcrm-summary-row strong{color:var(--text-primary);font-weight:var(--weight-semibold);}",
      "@media (prefers-color-scheme:light){.txcrm-root{--glass-bg:rgba(255,255,255,0.72);--glass-bg-heavy:rgba(255,255,255,0.86);--glass-border:rgba(0,0,0,0.08);--glass-shadow:0 8px 32px rgba(0,0,0,0.08);--glass-inset-highlight:inset 0 1px 0 rgba(255,255,255,0.5);--bg-app:#f5f5f7;--bg-surface:rgba(255,255,255,0.8);--bg-surface-hover:rgba(255,255,255,0.95);--bg-surface-subtle:rgba(255,255,255,0.5);--text-primary:rgba(0,0,0,0.87);--text-secondary:rgba(0,0,0,0.60);--text-tertiary:rgba(0,0,0,0.38);--border-default:rgba(0,0,0,0.08);--border-subtle:rgba(0,0,0,0.04);--border-strong:rgba(0,0,0,0.15);background:#f5f5f7;}.txcrm-grid th{background:rgba(255,255,255,.96);}.txcrm-select{color-scheme:light;background-image:" + selectChevronLight + ";}.txcrm-button.primary{color:#fff;}}",
      "@media(max-width:980px){.txcrm-root{padding:16px 12px}.txcrm-top{display:grid}.txcrm-status-card{min-width:0}.txcrm-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.txcrm-tabs{grid-template-columns:1fr 1fr}.txcrm-workspace,.txcrm-audience{grid-template-columns:1fr}.txcrm-toolbar{grid-template-columns:1fr}.txcrm-actions{justify-content:flex-start}.txcrm-form{grid-template-columns:1fr}.txcrm-form .wide{grid-column:auto}.txcrm-detail-foot{display:grid}.txcrm-detail-actions{justify-content:flex-start}}"
    ].join("");
    document.head.appendChild(style);
  }

  function initialState(data) {
    return {
      apiBase: String(data.api_base || data.apiBase || data.bridge_url || data.bridgeUrl || bridgeBaseFromPluginConfig()).replace(/\/$/, ""),
      organizationId: firstString([data.organization_id, data.organizationId], ""),
      userId: firstString([data.user_id, data.userId], ""),
      tab: tabs.indexOf(data.initial_tab || data.initialTab) >= 0 ? (data.initial_tab || data.initialTab) : "accounts",
      search: "",
      accountFilter: "",
      stageFilter: "",
      busy: false,
      status: "Ready",
      detail: "CRM workspace ready.",
      error: "",
      accounts: [],
      contacts: [],
      opportunities: [],
      stages: [],
      audience: Array.isArray(data.audience) ? data.audience : [],
      audienceMeta: {},
      selected: { accounts: "", contacts: "", opportunities: "", stages: "" },
      editMode: "create",
      form: {}
    };
  }

  function headers(state) {
    var result = { "Content-Type": "application/json" };
    if (state.organizationId) result["x-tribex-organization-id"] = state.organizationId;
    if (state.userId) result["x-tribex-user-id"] = state.userId;
    return result;
  }

  function query(params) {
    var out = new URLSearchParams();
    Object.keys(params).forEach(function(key) {
      if (params[key]) out.set(key, params[key]);
    });
    var text = out.toString();
    return text ? "?" + text : "";
  }

  function api(state, method, path, body) {
    return fetch(state.apiBase + path, {
      method: method,
      headers: headers(state),
      body: body ? JSON.stringify(body) : undefined
    }).then(function(response) {
      return response.text().then(function(text) {
        var payload = {};
        if (text) {
          try {
            payload = JSON.parse(text);
          } catch (error) {
            if (response.ok) throw error;
          }
        }
        if (!response.ok) {
          var message = payload.error && payload.error.message || "CRM request failed";
          throw new Error(message);
        }
        return payload.data;
      });
    });
  }

  function runBusy(state, status, detail, work) {
    state.busy = true;
    state.status = status;
    state.detail = detail || "";
    state.error = "";
    renderStatus(state);
    return Promise.resolve()
      .then(work)
      .catch(function(error) {
        if (window.console && window.console.warn) window.console.warn("[tribex-crm]", error);
        state.status = "Action needed";
        state.detail = "CRM could not complete the request.";
        state.error = friendlyError(error);
        renderStatus(state);
      })
      .finally(function() {
        state.busy = false;
        renderStatus(state);
      });
  }

  function friendlyError(error) {
    var message = String(error && error.message || "");
    if (/auth|unauthorized|forbidden|sign in|organization|membership/i.test(message)) {
      return "Sign in with a workspace that has CRM access, then refresh.";
    }
    if (/required|must|invalid|missing/i.test(message)) return message.replace(/Id\b/g, "");
    if (/fetch|network|failed to fetch/i.test(message)) return "CRM is not reachable right now. Refresh and try again.";
    return "CRM could not save the latest change. Refresh and try again.";
  }

  function renderStatus(state) {
    var el = state.container && state.container.querySelector("[data-role=status]");
    if (el) el.textContent = state.busy ? "Working" : state.status;
    var detail = state.container && state.container.querySelector("[data-role=status-detail]");
    if (detail) detail.textContent = state.busy ? state.detail || "Syncing CRM records." : state.detail || "CRM workspace ready.";
    var error = state.container && state.container.querySelector("[data-role=error]");
    if (error) {
      error.textContent = state.error || "";
      error.className = "txcrm-error" + (state.error ? " visible" : "");
    }
  }

  function rowsFrom(result) {
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.data)) return result.data;
    return [];
  }

  function refresh(state) {
    return runBusy(state, "Loading", "Syncing CRM records.", function() {
      var accountQuery = query({ search: state.search });
      return Promise.all([
        api(state, "GET", "/api/accounts" + accountQuery),
        api(state, "GET", "/api/contacts" + accountQuery),
        api(state, "GET", "/api/opportunities" + accountQuery),
        api(state, "GET", "/api/pipeline-stages")
      ]).then(function(results) {
        state.accounts = rowsFrom(results[0]);
        state.contacts = rowsFrom(results[1]);
        state.opportunities = rowsFrom(results[2]);
        state.stages = rowsFrom(results[3]);
        clearMissingSelections(state);
        state.status = "Current";
        state.detail = "CRM data is up to date.";
        renderShell(state);
      });
    });
  }

  function clearMissingSelections(state) {
    if (state.selected.accounts && !state.accounts.some(function(row) { return row.id === state.selected.accounts; })) state.selected.accounts = "";
    if (state.selected.contacts && !state.contacts.some(function(row) { return row.id === state.selected.contacts; })) state.selected.contacts = "";
    if (state.selected.opportunities && !state.opportunities.some(function(row) { return row.id === state.selected.opportunities; })) state.selected.opportunities = "";
    if (state.selected.stages && !state.stages.some(function(row) { return row.id === state.selected.stages; })) state.selected.stages = "";
  }

  function tabLabel(tab) {
    if (tab === "accounts") return "Accounts";
    if (tab === "contacts") return "Contacts";
    if (tab === "opportunities") return "Opportunities";
    if (tab === "stages") return "Pipeline";
    return "Audience";
  }

  function tabHelp(tab) {
    if (tab === "accounts") return "Companies, domains, and account ownership context.";
    if (tab === "contacts") return "People, buying roles, email status, and account relationships.";
    if (tab === "opportunities") return "Deals by stage, value, account, and expected close.";
    if (tab === "stages") return "Pipeline stages and probability defaults.";
    return "Contacts prepared for email campaign handoff.";
  }

  function singularLabel(tab) {
    if (tab === "accounts") return "Account";
    if (tab === "contacts") return "Contact";
    if (tab === "opportunities") return "Opportunity";
    if (tab === "stages") return "Stage";
    return "Audience";
  }

  function tabCount(state, tab) {
    if (tab === "accounts") return state.accounts.length;
    if (tab === "contacts") return state.contacts.length;
    if (tab === "opportunities") return state.opportunities.length;
    if (tab === "stages") return state.stages.length;
    return state.audience.length;
  }

  function accountName(state, id) {
    var account = state.accounts.find(function(item) { return item.id === id; });
    return account ? account.name : "";
  }

  function contactName(state, id) {
    var contact = state.contacts.find(function(item) { return item.id === id; });
    return contact ? contact.displayName : "";
  }

  function stageFor(state, id) {
    return state.stages.find(function(item) { return item.id === id; });
  }

  function stageLabel(state, id) {
    var stage = stageFor(state, id);
    if (!stage) return '<span class="txcrm-badge">Unstaged</span>';
    var cls = stage.category === "WON" ? " won" : stage.category === "LOST" ? " lost" : "";
    return '<span class="txcrm-badge' + cls + '">' + esc(stage.name) + "</span>";
  }

  function statusBadge(label, variant) {
    return '<span class="txcrm-badge ' + esc(variant || "") + '">' + esc(label) + "</span>";
  }

  function formatMoney(cents, currency) {
    if (cents === undefined || cents === null || cents === "") return "-";
    var amount = Number(cents) / 100;
    if (!Number.isFinite(amount)) return "-";
    try {
      return amount.toLocaleString([], {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: amount % 1 === 0 ? 0 : 2
      });
    } catch (_) {
      return "$" + amount.toLocaleString();
    }
  }

  function centsToDollars(cents) {
    if (cents === undefined || cents === null || cents === "") return "";
    var amount = Number(cents) / 100;
    return Number.isFinite(amount) ? String(amount) : "";
  }

  function moneyToCents(value) {
    if (value === undefined || value === null || String(value).trim() === "") return undefined;
    var amount = Number(String(value).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(amount) ? Math.round(amount * 100) : undefined;
  }

  function formatDate(value) {
    if (!value) return "-";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }

  function dateInputValue(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toISOString().slice(0, 10);
  }

  function accountOptions(state, selected) {
    return ['<option value="">No account</option>'].concat(state.accounts.map(function(account) {
      return '<option value="' + esc(account.id) + '"' + (account.id === selected ? " selected" : "") + ">" + esc(account.name) + "</option>";
    })).join("");
  }

  function requiredAccountOptions(state, selected) {
    return ['<option value="">Select account</option>'].concat(state.accounts.map(function(account) {
      return '<option value="' + esc(account.id) + '"' + (account.id === selected ? " selected" : "") + ">" + esc(account.name) + "</option>";
    })).join("");
  }

  function stageOptions(state, selected) {
    return ['<option value="">First open stage</option>'].concat(state.stages.map(function(stage) {
      return '<option value="' + esc(stage.id) + '"' + (stage.id === selected ? " selected" : "") + ">" + esc(stage.name) + "</option>";
    })).join("");
  }

  function contactOptions(state, selected, accountId) {
    var contacts = accountId ? state.contacts.filter(function(contact) {
      return !contact.accountId || contact.accountId === accountId;
    }) : state.contacts;
    return ['<option value="">No primary contact</option>'].concat(contacts.map(function(contact) {
      return '<option value="' + esc(contact.id) + '"' + (contact.id === selected ? " selected" : "") + ">" + esc(contact.displayName) + "</option>";
    })).join("");
  }

  function formField(name, label, value, extraClass, type) {
    return [
      '<label class="' + esc(extraClass || "") + '">',
      '<div class="txcrm-label">' + esc(label) + '</div>',
      '<input class="txcrm-input" type="' + esc(type || "text") + '" data-field="' + esc(name) + '" value="' + esc(value || "") + '">',
      '</label>'
    ].join("");
  }

  function textareaField(name, label, value, extraClass) {
    return [
      '<label class="' + esc(extraClass || "") + '">',
      '<div class="txcrm-label">' + esc(label) + '</div>',
      '<textarea class="txcrm-textarea" data-field="' + esc(name) + '">' + esc(value || "") + '</textarea>',
      '</label>'
    ].join("");
  }

  function selectField(name, label, options, extraClass) {
    return [
      '<label class="' + esc(extraClass || "") + '">',
      '<div class="txcrm-label">' + esc(label) + '</div>',
      '<select class="txcrm-select" data-field="' + esc(name) + '">' + options + '</select>',
      '</label>'
    ].join("");
  }

  function checkboxField(name, label, checked, extraClass) {
    return [
      '<label class="txcrm-check ' + esc(extraClass || "") + '">',
      '<input type="checkbox" data-field="' + esc(name) + '"' + (checked ? " checked" : "") + '>',
      '<span>' + esc(label) + '</span>',
      '</label>'
    ].join("");
  }

  function selectedRecord(state) {
    var id = state.selected[state.tab];
    if (!id) return null;
    if (state.tab === "accounts") return state.accounts.find(function(row) { return row.id === id; }) || null;
    if (state.tab === "contacts") return state.contacts.find(function(row) { return row.id === id; }) || null;
    if (state.tab === "opportunities") return state.opportunities.find(function(row) { return row.id === id; }) || null;
    if (state.tab === "stages") return state.stages.find(function(row) { return row.id === id; }) || null;
    return null;
  }

  function recordTitle(state, record) {
    if (!record) return "New " + singularLabel(state.tab).toLowerCase();
    if (state.tab === "contacts") return record.displayName;
    return record.name;
  }

  function formFromRecord(tab, record) {
    if (!record) return {};
    if (tab === "accounts") {
      return {
        name: record.name || "",
        domain: record.domain || "",
        website: record.website || "",
        industry: record.industry || ""
      };
    }
    if (tab === "contacts") {
      return {
        accountId: record.accountId || "",
        firstName: record.firstName || "",
        lastName: record.lastName || "",
        displayName: record.displayName || "",
        email: record.email || "",
        phone: record.phone || "",
        title: record.title || "",
        source: record.source || "",
        emailOptOut: !!record.emailOptOut
      };
    }
    if (tab === "opportunities") {
      return {
        accountId: record.accountId || "",
        primaryContactId: record.primaryContactId || "",
        stageId: record.stageId || "",
        name: record.name || "",
        amount: centsToDollars(record.amountCents),
        currency: record.currency || "USD",
        expectedCloseDate: dateInputValue(record.expectedCloseDate),
        description: record.description || ""
      };
    }
    if (tab === "stages") {
      return {
        name: record.name || "",
        category: record.category || "OPEN",
        probability: record.probability == null ? "" : String(record.probability),
        sortOrder: record.sortOrder == null ? "" : String(record.sortOrder)
      };
    }
    return {};
  }

  function bodyForForm(state) {
    var form = state.form;
    if (state.tab === "accounts") {
      return {
        name: form.name || "",
        domain: form.domain || "",
        website: form.website || "",
        industry: form.industry || ""
      };
    }
    if (state.tab === "contacts") {
      return {
        accountId: form.accountId || null,
        firstName: form.firstName || "",
        lastName: form.lastName || "",
        displayName: form.displayName || "",
        email: form.email || "",
        phone: form.phone || "",
        title: form.title || "",
        source: form.source || "",
        emailOptOut: !!form.emailOptOut
      };
    }
    if (state.tab === "opportunities") {
      return {
        accountId: form.accountId || "",
        primaryContactId: form.primaryContactId || null,
        stageId: form.stageId || null,
        name: form.name || "",
        amountCents: moneyToCents(form.amount),
        currency: form.currency || "USD",
        expectedCloseDate: form.expectedCloseDate || null,
        description: form.description || ""
      };
    }
    return {
      name: form.name || "",
      category: form.category || "OPEN",
      probability: form.probability === "" || form.probability == null ? null : Number(form.probability),
      sortOrder: form.sortOrder === "" || form.sortOrder == null ? undefined : Number(form.sortOrder)
    };
  }

  function validateForm(state) {
    var form = state.form;
    if (state.tab === "accounts" && !String(form.name || "").trim()) return "Account name is required.";
    if (state.tab === "contacts" && !String(form.displayName || form.firstName || form.lastName || form.email || "").trim()) return "Add a contact name or email.";
    if (state.tab === "opportunities") {
      if (!String(form.accountId || "").trim()) return "Choose an account for the opportunity.";
      if (!String(form.name || "").trim()) return "Opportunity name is required.";
    }
    if (state.tab === "stages" && !String(form.name || "").trim()) return "Stage name is required.";
    return "";
  }

  function renderMetrics(state) {
    var openStages = {};
    state.stages.forEach(function(stage) {
      if (stage.category === "OPEN") openStages[stage.id] = true;
    });
    var openOpportunities = state.opportunities.filter(function(opportunity) {
      return openStages[opportunity.stageId] !== false && (!stageFor(state, opportunity.stageId) || stageFor(state, opportunity.stageId).category === "OPEN");
    });
    var pipelineCents = openOpportunities.reduce(function(total, opportunity) {
      return total + Number(opportunity.amountCents || 0);
    }, 0);
    return [
      '<div class="txcrm-metrics">',
      metric("Accounts", state.accounts.length, "active companies"),
      metric("Contacts", state.contacts.length, "reachable people"),
      metric("Open pipeline", formatMoney(pipelineCents, "USD"), openOpportunities.length + " active deals"),
      metric("Audience", state.audience.length, "ready rows"),
      '</div>'
    ].join("");
  }

  function metric(label, value, sublabel) {
    return '<div class="txcrm-metric"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong><em>' + esc(sublabel) + '</em></div>';
  }

  function contactsForAccount(state, accountId) {
    return state.contacts.filter(function(contact) { return contact.accountId === accountId; }).length;
  }

  function opportunitiesForAccount(state, accountId) {
    return state.opportunities.filter(function(opportunity) { return opportunity.accountId === accountId; }).length;
  }

  function filteredContacts(state) {
    return state.accountFilter
      ? state.contacts.filter(function(row) { return row.accountId === state.accountFilter; })
      : state.contacts;
  }

  function filteredOpportunities(state) {
    return state.opportunities.filter(function(row) {
      if (state.accountFilter && row.accountId !== state.accountFilter) return false;
      if (state.stageFilter && row.stageId !== state.stageFilter) return false;
      return true;
    });
  }

  function table(headers, rows, emptyText) {
    if (!rows.length) return '<div class="txcrm-empty">' + esc(emptyText || "No records yet") + '</div>';
    return [
      '<div class="txcrm-grid-wrap"><table class="txcrm-grid"><thead><tr>',
      headers.map(function(header) { return '<th>' + esc(header) + '</th>'; }).join(""),
      '</tr></thead><tbody>',
      rows.join(""),
      '</tbody></table></div>'
    ].join("");
  }

  function renderTable(state) {
    if (state.tab === "accounts") {
      return table(["Account", "Domain", "Industry", "Contacts", "Deals"], state.accounts.map(function(row) {
        var active = state.selected.accounts === row.id ? " active" : "";
        return '<tr class="' + active + '" data-action="select-record" data-id="' + esc(row.id) + '"><td><div class="txcrm-record-primary"><strong>' + esc(row.name) + '</strong><span>' + esc(row.website || row.domain || "No website") + '</span></div></td><td>' + esc(row.domain || '-') + '</td><td>' + esc(row.industry || '-') + '</td><td>' + esc(contactsForAccount(state, row.id)) + '</td><td>' + esc(opportunitiesForAccount(state, row.id)) + '</td></tr>';
      }), "No accounts yet");
    }
    if (state.tab === "contacts") {
      return table(["Contact", "Account", "Email", "Title", "Email"], filteredContacts(state).map(function(row) {
        var active = state.selected.contacts === row.id ? " active" : "";
        var emailStatus = row.emailOptOut ? statusBadge("Opted out", "warn") : statusBadge("Subscribed", "info");
        return '<tr class="' + active + '" data-action="select-record" data-id="' + esc(row.id) + '"><td><div class="txcrm-record-primary"><strong>' + esc(row.displayName) + '</strong><span>' + esc(row.phone || row.source || "Contact") + '</span></div></td><td>' + esc(accountName(state, row.accountId) || '-') + '</td><td>' + esc(row.email || '-') + '</td><td>' + esc(row.title || '-') + '</td><td>' + emailStatus + '</td></tr>';
      }), "No contacts match this view");
    }
    if (state.tab === "opportunities") {
      return table(["Opportunity", "Account", "Stage", "Amount", "Close"], filteredOpportunities(state).map(function(row) {
        var active = state.selected.opportunities === row.id ? " active" : "";
        return '<tr class="' + active + '" data-action="select-record" data-id="' + esc(row.id) + '"><td><div class="txcrm-record-primary"><strong>' + esc(row.name) + '</strong><span>' + esc(contactName(state, row.primaryContactId) || "No primary contact") + '</span></div></td><td>' + esc(accountName(state, row.accountId) || '-') + '</td><td>' + stageLabel(state, row.stageId) + '</td><td>' + esc(formatMoney(row.amountCents, row.currency)) + '</td><td>' + esc(formatDate(row.expectedCloseDate)) + '</td></tr>';
      }), "No opportunities match this view");
    }
    if (state.tab === "stages") {
      return table(["Stage", "Category", "Probability", "Deals", "Order"], state.stages.map(function(row) {
        var active = state.selected.stages === row.id ? " active" : "";
        var deals = state.opportunities.filter(function(opportunity) { return opportunity.stageId === row.id; }).length;
        return '<tr class="' + active + '" data-action="select-record" data-id="' + esc(row.id) + '"><td><div class="txcrm-record-primary"><strong>' + esc(row.name) + '</strong><span>' + (row.isDefault ? 'Default stage' : 'Custom stage') + '</span></div></td><td>' + statusBadge(String(row.category || "OPEN").toLowerCase(), row.category === "WON" ? "won" : row.category === "LOST" ? "lost" : "") + '</td><td>' + esc(row.probability == null ? '-' : row.probability + '%') + '</td><td>' + esc(deals) + '</td><td>' + esc(row.sortOrder) + '</td></tr>';
      }), "No pipeline stages yet");
    }
    return "";
  }

  function renderPipelineSummary(state) {
    if (state.tab !== "opportunities") return "";
    var cards = ['<button type="button" class="txcrm-stage-card' + (state.stageFilter ? '' : ' active') + '" data-action="stage-filter" data-id=""><span>All stages</span><strong>' + esc(filteredOpportunities(Object.assign({}, state, { stageFilter: "" })).length) + ' deals</strong><em>' + esc(formatMoney(filteredOpportunities(Object.assign({}, state, { stageFilter: "" })).reduce(function(total, row) { return total + Number(row.amountCents || 0); }, 0), "USD")) + '</em></button>'];
    state.stages.forEach(function(stage) {
      var rows = state.opportunities.filter(function(row) {
        if (state.accountFilter && row.accountId !== state.accountFilter) return false;
        return row.stageId === stage.id;
      });
      var total = rows.reduce(function(sum, row) { return sum + Number(row.amountCents || 0); }, 0);
      cards.push('<button type="button" class="txcrm-stage-card' + (state.stageFilter === stage.id ? ' active' : '') + '" data-action="stage-filter" data-id="' + esc(stage.id) + '"><span>' + esc(stage.category || "OPEN") + '</span><strong>' + esc(stage.name) + '</strong><em>' + esc(rows.length + " deals - " + formatMoney(total, "USD")) + '</em></button>');
    });
    return '<div class="txcrm-pipeline">' + cards.join("") + '</div>';
  }

  function renderToolbar(state) {
    var filter = "";
    if (state.tab === "contacts" || state.tab === "opportunities") {
      filter = selectField("accountFilter", "Account", ['<option value="">All accounts</option>'].concat(state.accounts.map(function(account) {
        return '<option value="' + esc(account.id) + '"' + (state.accountFilter === account.id ? " selected" : "") + ">" + esc(account.name) + "</option>";
      })).join(""));
    } else {
      filter = '<div></div>';
    }
    return [
      '<div class="txcrm-toolbar">',
      '<label><div class="txcrm-label">Search</div><input class="txcrm-input" data-role="search" value="' + esc(state.search) + '"></label>',
      filter,
      '<div class="txcrm-actions">',
      '<button class="txcrm-button" data-action="refresh">Refresh</button>',
      state.tab !== "audience" ? '<button class="txcrm-button primary" data-action="new-record">New ' + esc(singularLabel(state.tab)) + '</button>' : '',
      state.tab !== "stages" ? '<button class="txcrm-button" data-action="export-audience">Export audience</button>' : '',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderFormFields(state) {
    var form = state.form;
    if (state.tab === "accounts") {
      return [
        formField("name", "Account name", form.name, "wide"),
        formField("domain", "Domain", form.domain),
        formField("website", "Website", form.website),
        formField("industry", "Industry", form.industry, "wide")
      ].join("");
    }
    if (state.tab === "contacts") {
      return [
        selectField("accountId", "Account", accountOptions(state, form.accountId), "wide"),
        formField("firstName", "First name", form.firstName),
        formField("lastName", "Last name", form.lastName),
        formField("displayName", "Display name", form.displayName, "wide"),
        formField("email", "Email", form.email, "", "email"),
        formField("phone", "Phone", form.phone),
        formField("title", "Title", form.title),
        formField("source", "Source", form.source),
        checkboxField("emailOptOut", "Exclude from email audience", !!form.emailOptOut, "wide")
      ].join("");
    }
    if (state.tab === "opportunities") {
      return [
        selectField("accountId", "Account", requiredAccountOptions(state, form.accountId), "wide"),
        formField("name", "Opportunity name", form.name, "wide"),
        selectField("stageId", "Stage", stageOptions(state, form.stageId)),
        selectField("primaryContactId", "Primary contact", contactOptions(state, form.primaryContactId, form.accountId)),
        formField("amount", "Amount", form.amount),
        formField("currency", "Currency", form.currency || "USD"),
        formField("expectedCloseDate", "Expected close", form.expectedCloseDate, "", "date"),
        textareaField("description", "Notes", form.description, "wide")
      ].join("");
    }
    return [
      formField("name", "Stage name", form.name, "wide"),
      selectField("category", "Category", '<option value="OPEN"' + (form.category === "OPEN" ? " selected" : "") + '>Open</option><option value="WON"' + (form.category === "WON" ? " selected" : "") + '>Won</option><option value="LOST"' + (form.category === "LOST" ? " selected" : "") + '>Lost</option>'),
      formField("probability", "Probability", form.probability, "", "number"),
      formField("sortOrder", "Order", form.sortOrder, "", "number")
    ].join("");
  }

  function renderDetail(state) {
    var record = selectedRecord(state);
    var isEdit = state.editMode === "edit" && record;
    var title = isEdit ? recordTitle(state, record) : "New " + singularLabel(state.tab).toLowerCase();
    return [
      '<aside class="txcrm-panel txcrm-detail">',
      '<div class="txcrm-panel-header">',
      '<div><p class="txcrm-section-kicker">' + esc(isEdit ? "Selected record" : "Quick create") + '</p><h3 class="txcrm-panel-title">' + esc(title) + '</h3><p class="txcrm-small">' + esc(isEdit ? "Review details, update fields, or archive the record." : "Add the next record without leaving the current view.") + '</p></div>',
      '</div>',
      '<div class="txcrm-form">',
      renderFormFields(state),
      '</div>',
      '<div class="txcrm-detail-foot">',
      isEdit ? '<button class="txcrm-button danger" data-action="archive-record">Archive</button>' : '<span class="txcrm-small">Ready for entry</span>',
      '<div class="txcrm-detail-actions">',
      isEdit ? '<button class="txcrm-button" data-action="new-record">New</button>' : '',
      '<button class="txcrm-button primary" data-action="save-record">' + esc(isEdit ? "Save changes" : "Create") + '</button>',
      '</div>',
      '</div>',
      '</aside>'
    ].join("");
  }

  function renderAudience(state) {
    var meta = state.audienceMeta || {};
    return [
      '<div class="txcrm-audience">',
      '<section class="txcrm-panel">',
      '<div class="txcrm-panel-header"><div><p class="txcrm-section-kicker">Campaign Audience</p><h3 class="txcrm-panel-title">Audience rows</h3><p class="txcrm-small">Eligible contacts are ready for the email campaign workflow.</p></div><div class="txcrm-actions"><button class="txcrm-button primary" data-action="export-audience">Refresh audience</button></div></div>',
      table(["Email", "Name", "Company", "Opportunity", "Stage"], state.audience.map(function(row, index) {
        return '<tr><td>' + esc(row.email || row.emailAddress || row.email_address || '') + '</td><td>' + esc(row.displayName || '') + '</td><td>' + esc(row.company || row.accountName || '') + '</td><td>' + esc(row.opportunityName || '') + '</td><td>' + esc(row.opportunityStageName || '') + '</td></tr>';
      }), "Export an audience to preview eligible contacts"),
      '</section>',
      '<aside class="txcrm-panel">',
      '<div class="txcrm-panel-header"><div><p class="txcrm-section-kicker">Handoff</p><h3 class="txcrm-panel-title">Email audience</h3></div></div>',
      '<div class="txcrm-audience-side">',
      '<div class="txcrm-summary-list">',
      '<div class="txcrm-summary-row"><span>Rows ready</span><strong>' + esc(state.audience.length) + '</strong></div>',
      '<div class="txcrm-summary-row"><span>Contacts reviewed</span><strong>' + esc(meta.totalContacts == null ? state.contacts.length : meta.totalContacts) + '</strong></div>',
      '<div class="txcrm-summary-row"><span>Opt-outs skipped</span><strong>' + esc(meta.skippedOptedOut == null ? 0 : meta.skippedOptedOut) + '</strong></div>',
      '<div class="txcrm-summary-row"><span>Missing emails skipped</span><strong>' + esc(meta.skippedMissingEmail == null ? 0 : meta.skippedMissingEmail) + '</strong></div>',
      '</div>',
      '<div class="txcrm-actions"><button class="txcrm-button" data-action="copy-audience">Copy audience</button><button class="txcrm-button" data-action="refresh">Refresh CRM</button></div>',
      '</div>',
      '</aside>',
      '</div>'
    ].join("");
  }

  function renderMain(state) {
    if (!state.container) return;
    var panel = state.container.querySelector("[data-role=main]");
    if (!panel) return;
    if (state.tab === "audience") {
      panel.innerHTML = [
        '<div class="txcrm-error" data-role="error"></div>',
        renderAudience(state)
      ].join("");
      wireMain(state);
      renderStatus(state);
      return;
    }
    panel.innerHTML = [
      '<div class="txcrm-error" data-role="error"></div>',
      '<section class="txcrm-workspace">',
      '<section class="txcrm-panel">',
      '<div class="txcrm-panel-header">',
      '<div><p class="txcrm-section-kicker">CRM Records</p><h3 class="txcrm-panel-title">' + esc(tabLabel(state.tab)) + '</h3><p class="txcrm-small">' + esc(tabHelp(state.tab)) + '</p></div>',
      '</div>',
      renderToolbar(state),
      renderPipelineSummary(state),
      renderTable(state),
      '</section>',
      renderDetail(state),
      '</section>'
    ].join("");
    wireMain(state);
    renderStatus(state);
  }

  function wireMain(state) {
    var main = state.container.querySelector("[data-role=main]");
    if (!main) return;
    main.querySelectorAll("[data-field]").forEach(function(input) {
      var update = function() {
        var field = input.getAttribute("data-field");
        state.form[field] = input.type === "checkbox" ? input.checked : input.value;
        if (field === "accountFilter") {
          state.accountFilter = input.value;
          renderMain(state);
        }
      };
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });
    var search = main.querySelector("[data-role=search]");
    if (search) {
      search.addEventListener("change", function() {
        state.search = search.value;
        refresh(state);
      });
      search.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
          state.search = search.value;
          refresh(state);
        }
      });
    }
    main.querySelectorAll("[data-action]").forEach(function(element) {
      element.addEventListener("click", function(event) {
        event.preventDefault();
        handleAction(state, element.getAttribute("data-action"), element.getAttribute("data-id"));
      });
    });
  }

  function handleAction(state, action, id) {
    if (action === "refresh") {
      refresh(state);
      return;
    }
    if (action === "select-record") {
      state.selected[state.tab] = id;
      state.editMode = "edit";
      state.form = formFromRecord(state.tab, selectedRecord(state));
      renderMain(state);
      return;
    }
    if (action === "new-record") {
      state.selected[state.tab] = "";
      state.editMode = "create";
      state.form = {};
      renderMain(state);
      return;
    }
    if (action === "stage-filter") {
      state.stageFilter = id === state.stageFilter ? "" : (id || "");
      renderMain(state);
      return;
    }
    if (action === "save-record") {
      saveRecord(state);
      return;
    }
    if (action === "archive-record") {
      archiveRecord(state);
      return;
    }
    if (action === "export-audience") {
      exportAudience(state);
      return;
    }
    if (action === "copy-audience") {
      copyAudience(state);
    }
  }

  function saveRecord(state) {
    var validation = validateForm(state);
    if (validation) {
      state.error = validation;
      renderStatus(state);
      return;
    }
    var record = selectedRecord(state);
    var isEdit = state.editMode === "edit" && record;
    var endpoints = {
      accounts: "/api/accounts",
      contacts: "/api/contacts",
      opportunities: "/api/opportunities",
      stages: "/api/pipeline-stages"
    };
    var base = endpoints[state.tab];
    var path = isEdit ? base + "/" + encodeURIComponent(record.id) : base;
    var method = isEdit ? "PATCH" : "POST";
    var body = bodyForForm(state);
    runBusy(state, isEdit ? "Saving" : "Creating", "Updating CRM record.", function() {
      return api(state, method, path, body).then(function(result) {
        var saved = result && result.id ? result : null;
        if (saved) state.selected[state.tab] = saved.id;
        state.editMode = saved ? "edit" : state.editMode;
        state.status = isEdit ? "Saved" : "Created";
        state.detail = "CRM record updated.";
        return refresh(state);
      });
    });
  }

  function archiveRecord(state) {
    var record = selectedRecord(state);
    if (!record) return;
    var endpoints = {
      accounts: "/api/accounts",
      contacts: "/api/contacts",
      opportunities: "/api/opportunities",
      stages: "/api/pipeline-stages"
    };
    var path = endpoints[state.tab] + "/" + encodeURIComponent(record.id);
    runBusy(state, "Archiving", "Removing record from active CRM views.", function() {
      return api(state, "DELETE", path).then(function() {
        state.selected[state.tab] = "";
        state.editMode = "create";
        state.form = {};
        state.status = "Archived";
        state.detail = "Record removed from active CRM views.";
        return refresh(state);
      });
    });
  }

  function exportAudience(state) {
    runBusy(state, "Exporting", "Preparing eligible contacts for campaign use.", function() {
      return api(state, "POST", "/api/audience-export", {}).then(function(result) {
        state.audience = result && Array.isArray(result.rows) ? result.rows : [];
        state.audienceMeta = result && result.meta ? result.meta : {};
        state.tab = "audience";
        state.status = "Audience ready";
        state.detail = state.audience.length + " contacts prepared for email.";
        renderShell(state);
      });
    });
  }

  function copyAudience(state) {
    var text = JSON.stringify(state.audience || [], null, 2);
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      state.error = "Copy is not available in this window.";
      renderStatus(state);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      state.status = "Copied";
      state.detail = "Audience rows copied.";
      state.error = "";
      renderStatus(state);
    }).catch(function() {
      state.error = "Copy is not available in this window.";
      renderStatus(state);
    });
  }

  function renderShell(state) {
    state.container.innerHTML = [
      '<div class="txcrm-root"><div class="txcrm-shell">',
      '<div class="txcrm-top">',
      '<div class="txcrm-title"><div class="txcrm-kicker">CRM Workspace</div><h2>TribeX CRM</h2><p>Account, contact, opportunity, pipeline, and email audience workflows in one operational surface.</p></div>',
      '<div class="txcrm-status-card"><strong data-role="status">' + esc(state.busy ? 'Working' : state.status || 'Ready') + '</strong><span data-role="status-detail">' + esc(state.detail || 'CRM workspace ready.') + '</span></div>',
      '</div>',
      renderMetrics(state),
      '<nav class="txcrm-tabs" aria-label="CRM workspace">',
      tabs.map(function(tab) { return '<button type="button" class="txcrm-tab" aria-selected="' + (state.tab === tab) + '" data-tab="' + esc(tab) + '"><span>' + esc(tabCount(state, tab)) + ' records</span><strong>' + esc(tabLabel(tab)) + '</strong></button>'; }).join(""),
      '</nav>',
      '<section class="txcrm-main" data-role="main"></section>',
      '</div></div>'
    ].join("");
    state.container.querySelectorAll("[data-tab]").forEach(function(button) {
      button.addEventListener("click", function() {
        state.tab = button.getAttribute("data-tab");
        state.editMode = state.selected[state.tab] ? "edit" : "create";
        state.form = formFromRecord(state.tab, selectedRecord(state));
        renderShell(state);
      });
    });
    renderMain(state);
  }

  window.__renderers.tribex_crm = function(container, data) {
    injectStyles();
    var state = initialState(data || {});
    state.container = container;
    renderShell(state);
    refresh(state);
  };
})();
