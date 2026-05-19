(function() {
  "use strict";

  window.__renderers = window.__renderers || {};

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

  function injectStyles() {
    if (styleInjected) return;
    styleInjected = true;
    var style = document.createElement("style");
    style.textContent = [
      ".txcrm-root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#16201f;background:#f7f8f6;min-height:100%;}",
      ".txcrm-shell{display:grid;grid-template-columns:240px minmax(0,1fr);min-height:720px;}",
      ".txcrm-side{background:#132522;color:#f7faf8;padding:18px 14px;border-right:1px solid #0b1715;}",
      ".txcrm-brand{font-size:18px;font-weight:700;margin:0 0 16px;letter-spacing:0;}",
      ".txcrm-context{display:grid;gap:8px;margin-bottom:18px;}",
      ".txcrm-label{font-size:11px;text-transform:uppercase;color:#7b8f89;font-weight:700;margin-bottom:4px;}",
      ".txcrm-input,.txcrm-select{width:100%;box-sizing:border-box;border:1px solid #cbd5d1;background:#fff;color:#132522;border-radius:6px;padding:8px 9px;font-size:13px;}",
      ".txcrm-side .txcrm-input{background:#203430;color:#f7faf8;border-color:#39524b;}",
      ".txcrm-tabs{display:grid;gap:4px;}",
      ".txcrm-tab{border:0;background:transparent;color:#cfe1dc;text-align:left;padding:9px 10px;border-radius:6px;font-weight:650;cursor:pointer;}",
      ".txcrm-tab[aria-selected=true]{background:#d7f2e8;color:#132522;}",
      ".txcrm-main{padding:18px 20px 28px;display:grid;grid-template-rows:auto auto 1fr;gap:14px;}",
      ".txcrm-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}",
      ".txcrm-title{font-size:24px;line-height:1.15;margin:0;color:#132522;letter-spacing:0;}",
      ".txcrm-status{font-size:12px;color:#48615b;min-height:18px;text-align:right;}",
      ".txcrm-toolbar{display:grid;grid-template-columns:minmax(160px,320px) auto 1fr;align-items:end;gap:10px;}",
      ".txcrm-actions{display:flex;gap:8px;align-items:center;justify-content:flex-end;}",
      ".txcrm-button{border:1px solid #9aacaa;background:#fff;color:#132522;border-radius:6px;padding:8px 10px;font-size:13px;font-weight:650;cursor:pointer;white-space:nowrap;}",
      ".txcrm-button.primary{border-color:#146b55;background:#146b55;color:#fff;}",
      ".txcrm-button.danger{border-color:#b45c50;color:#7b261e;}",
      ".txcrm-button:disabled{opacity:.55;cursor:not-allowed;}",
      ".txcrm-panel{border:1px solid #d8dfdc;background:#fff;border-radius:8px;overflow:hidden;}",
      ".txcrm-grid{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed;}",
      ".txcrm-grid th{background:#eef3f0;color:#405650;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0;padding:9px;border-bottom:1px solid #d8dfdc;}",
      ".txcrm-grid td{padding:9px;border-bottom:1px solid #eef1ef;vertical-align:top;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
      ".txcrm-grid tr:last-child td{border-bottom:0;}",
      ".txcrm-empty{padding:26px;color:#657973;font-size:13px;text-align:center;}",
      ".txcrm-form{display:grid;grid-template-columns:repeat(4,minmax(130px,1fr));gap:10px;padding:12px;background:#f0f5f2;border-bottom:1px solid #d8dfdc;}",
      ".txcrm-form .wide{grid-column:span 2;}",
      ".txcrm-badge{display:inline-block;border-radius:999px;padding:2px 7px;font-size:11px;font-weight:700;background:#e2ece7;color:#23433b;}",
      ".txcrm-badge.won{background:#dff2d5;color:#225415;}",
      ".txcrm-badge.lost{background:#f5ded9;color:#733128;}",
      ".txcrm-audience{display:grid;grid-template-columns:1fr 340px;gap:12px;}",
      ".txcrm-json{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;white-space:pre;overflow:auto;max-height:420px;padding:12px;background:#101918;color:#e7f2ee;}",
      "@media(max-width:780px){.txcrm-shell{grid-template-columns:1fr}.txcrm-side{border-right:0}.txcrm-toolbar{grid-template-columns:1fr}.txcrm-actions{justify-content:flex-start}.txcrm-form{grid-template-columns:1fr}.txcrm-form .wide{grid-column:auto}.txcrm-audience{grid-template-columns:1fr}}"
    ].join("");
    document.head.appendChild(style);
  }

  function initialState(data) {
    return {
      apiBase: String(data.api_base || data.apiBase || "http://127.0.0.1:3012").replace(/\/$/, ""),
      organizationId: data.organization_id || data.organizationId || "",
      userId: data.user_id || data.userId || "",
      tab: tabs.indexOf(data.initial_tab || data.initialTab) >= 0 ? (data.initial_tab || data.initialTab) : "accounts",
      search: "",
      busy: false,
      status: "",
      accounts: [],
      contacts: [],
      opportunities: [],
      stages: [],
      audience: Array.isArray(data.audience) ? data.audience : [],
      form: {}
    };
  }

  function headers(state) {
    return {
      "Content-Type": "application/json",
      "x-tribex-organization-id": state.organizationId,
      "x-tribex-user-id": state.userId
    };
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
    state.busy = true;
    renderStatus(state);
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
        if (!response.ok) throw new Error(payload.error && payload.error.message || "Request failed");
        return payload.data;
      });
    }).finally(function() {
      state.busy = false;
      renderStatus(state);
    });
  }

  function setStatus(state, message) {
    state.status = message || "";
    renderStatus(state);
  }

  function renderStatus(state) {
    var el = state.container && state.container.querySelector("[data-role=status]");
    if (el) el.textContent = state.busy ? "Working" : state.status;
  }

  function refresh(state) {
    if (!state.organizationId || !state.userId) {
      setStatus(state, "Auth context required");
      return Promise.resolve();
    }
    var accountQuery = query({ search: state.search });
    return Promise.all([
      api(state, "GET", "/api/accounts" + accountQuery),
      api(state, "GET", "/api/contacts" + accountQuery),
      api(state, "GET", "/api/opportunities" + accountQuery),
      api(state, "GET", "/api/pipeline-stages")
    ]).then(function(results) {
      state.accounts = results[0].data || results[0] || [];
      state.contacts = results[1].data || results[1] || [];
      state.opportunities = results[2].data || results[2] || [];
      state.stages = results[3] || [];
      setStatus(state, "Loaded");
      renderMain(state);
    }).catch(function(error) {
      setStatus(state, error.message);
    });
  }

  function accountOptions(state, selected) {
    return ['<option value="">Account</option>'].concat(state.accounts.map(function(account) {
      return '<option value="' + esc(account.id) + '"' + (account.id === selected ? " selected" : "") + ">" + esc(account.name) + "</option>";
    })).join("");
  }

  function stageOptions(state, selected) {
    return ['<option value="">Stage</option>'].concat(state.stages.map(function(stage) {
      return '<option value="' + esc(stage.id) + '"' + (stage.id === selected ? " selected" : "") + ">" + esc(stage.name) + "</option>";
    })).join("");
  }

  function stageLabel(state, id) {
    var stage = state.stages.find(function(item) { return item.id === id; });
    if (!stage) return "";
    var cls = stage.category === "WON" ? " won" : stage.category === "LOST" ? " lost" : "";
    return '<span class="txcrm-badge' + cls + '">' + esc(stage.name) + "</span>";
  }

  function accountName(state, id) {
    var account = state.accounts.find(function(item) { return item.id === id; });
    return account ? account.name : "";
  }

  function formField(name, label, value, extraClass) {
    return [
      '<label class="' + esc(extraClass || "") + '">',
      '<div class="txcrm-label">' + esc(label) + '</div>',
      '<input class="txcrm-input" data-field="' + esc(name) + '" value="' + esc(value || "") + '">',
      '</label>'
    ].join("");
  }

  function renderCreateForm(state) {
    if (state.tab === "accounts") {
      return [
        '<div class="txcrm-form">',
        formField("name", "Account", state.form.name, "wide"),
        formField("domain", "Domain", state.form.domain),
        formField("industry", "Industry", state.form.industry),
        '<button class="txcrm-button primary" data-action="create-account">Add account</button>',
        '</div>'
      ].join("");
    }
    if (state.tab === "contacts") {
      return [
        '<div class="txcrm-form">',
        '<label><div class="txcrm-label">Account</div><select class="txcrm-select" data-field="accountId">' + accountOptions(state, state.form.accountId) + '</select></label>',
        formField("firstName", "First", state.form.firstName),
        formField("lastName", "Last", state.form.lastName),
        formField("email", "Email", state.form.email),
        formField("title", "Title", state.form.title),
        '<button class="txcrm-button primary" data-action="create-contact">Add contact</button>',
        '</div>'
      ].join("");
    }
    if (state.tab === "opportunities") {
      return [
        '<div class="txcrm-form">',
        '<label><div class="txcrm-label">Account</div><select class="txcrm-select" data-field="accountId">' + accountOptions(state, state.form.accountId) + '</select></label>',
        formField("name", "Opportunity", state.form.name),
        '<label><div class="txcrm-label">Stage</div><select class="txcrm-select" data-field="stageId">' + stageOptions(state, state.form.stageId) + '</select></label>',
        formField("amountCents", "Amount cents", state.form.amountCents),
        '<button class="txcrm-button primary" data-action="create-opportunity">Add opportunity</button>',
        '</div>'
      ].join("");
    }
    if (state.tab === "stages") {
      return [
        '<div class="txcrm-form">',
        formField("name", "Stage", state.form.name),
        '<label><div class="txcrm-label">Category</div><select class="txcrm-select" data-field="category"><option>OPEN</option><option>WON</option><option>LOST</option></select></label>',
        formField("probability", "Probability", state.form.probability),
        '<button class="txcrm-button primary" data-action="create-stage">Add stage</button>',
        '</div>'
      ].join("");
    }
    return "";
  }

  function table(headers, rows) {
    if (!rows.length) return '<div class="txcrm-empty">No records</div>';
    return [
      '<table class="txcrm-grid"><thead><tr>',
      headers.map(function(header) { return '<th>' + esc(header) + '</th>'; }).join(""),
      '</tr></thead><tbody>',
      rows.join(""),
      '</tbody></table>'
    ].join("");
  }

  function renderTable(state) {
    if (state.tab === "accounts") {
      return table(["Account", "Domain", "Industry", "Owner", ""], state.accounts.map(function(row) {
        return '<tr><td>' + esc(row.name) + '</td><td>' + esc(row.domain || '') + '</td><td>' + esc(row.industry || '') + '</td><td>' + esc(row.ownerId || '') + '</td><td><button class="txcrm-button danger" data-action="archive-account" data-id="' + esc(row.id) + '">Archive</button></td></tr>';
      }));
    }
    if (state.tab === "contacts") {
      return table(["Contact", "Email", "Account", "Title", ""], state.contacts.map(function(row) {
        return '<tr><td>' + esc(row.displayName) + '</td><td>' + esc(row.email || '') + '</td><td>' + esc(accountName(state, row.accountId)) + '</td><td>' + esc(row.title || '') + '</td><td><button class="txcrm-button danger" data-action="archive-contact" data-id="' + esc(row.id) + '">Archive</button></td></tr>';
      }));
    }
    if (state.tab === "opportunities") {
      return table(["Opportunity", "Account", "Stage", "Amount", ""], state.opportunities.map(function(row) {
        return '<tr><td>' + esc(row.name) + '</td><td>' + esc(accountName(state, row.accountId)) + '</td><td>' + stageLabel(state, row.stageId) + '</td><td>' + esc(row.amountCents || '') + '</td><td><button class="txcrm-button danger" data-action="archive-opportunity" data-id="' + esc(row.id) + '">Archive</button></td></tr>';
      }));
    }
    if (state.tab === "stages") {
      return table(["Stage", "Category", "Probability", "Order"], state.stages.map(function(row) {
        return '<tr><td>' + esc(row.name) + '</td><td>' + esc(row.category) + '</td><td>' + esc(row.probability == null ? '' : row.probability) + '</td><td>' + esc(row.sortOrder) + '</td></tr>';
      }));
    }
    return renderAudience(state);
  }

  function renderAudience(state) {
    return [
      '<div class="txcrm-audience">',
      '<div class="txcrm-panel">',
      table(["Email", "Name", "Company", "Opportunity"], state.audience.map(function(row) {
        return '<tr><td>' + esc(row.email || row.emailAddress || row.email_address || '') + '</td><td>' + esc(row.displayName || '') + '</td><td>' + esc(row.company || row.accountName || '') + '</td><td>' + esc(row.opportunityName || '') + '</td></tr>';
      })),
      '</div>',
      '<div class="txcrm-panel"><pre class="txcrm-json">' + esc(JSON.stringify(state.audience, null, 2)) + '</pre></div>',
      '</div>'
    ].join("");
  }

  function renderMain(state) {
    if (!state.container) return;
    var title = state.tab.charAt(0).toUpperCase() + state.tab.slice(1);
    var panel = state.container.querySelector("[data-role=main]");
    if (!panel) return;
    panel.innerHTML = [
      '<div class="txcrm-head">',
      '<h1 class="txcrm-title">' + esc(title) + '</h1>',
      '<div class="txcrm-status" data-role="status">' + esc(state.busy ? 'Working' : state.status) + '</div>',
      '</div>',
      '<div class="txcrm-toolbar">',
      '<label><div class="txcrm-label">Search</div><input class="txcrm-input" data-role="search" value="' + esc(state.search) + '"></label>',
      '<button class="txcrm-button" data-action="refresh">Refresh</button>',
      '<div class="txcrm-actions"><button class="txcrm-button" data-action="export-audience">Export audience</button></div>',
      '</div>',
      '<div class="txcrm-panel">',
      renderCreateForm(state),
      renderTable(state),
      '</div>'
    ].join("");
    wireMain(state);
  }

  function wireMain(state) {
    var main = state.container.querySelector("[data-role=main]");
    main.querySelectorAll("[data-field]").forEach(function(input) {
      input.addEventListener("input", function() {
        state.form[input.getAttribute("data-field")] = input.value;
      });
      input.addEventListener("change", function() {
        state.form[input.getAttribute("data-field")] = input.value;
      });
    });
    var search = main.querySelector("[data-role=search]");
    if (search) search.addEventListener("change", function() {
      state.search = search.value;
      refresh(state);
    });
    main.querySelectorAll("[data-action]").forEach(function(button) {
      button.addEventListener("click", function() {
        handleAction(state, button.getAttribute("data-action"), button.getAttribute("data-id"));
      });
    });
  }

  function handleAction(state, action, id) {
    var form = state.form;
    var run;
    if (action === "refresh") run = refresh(state);
    if (action === "create-account") run = api(state, "POST", "/api/accounts", form);
    if (action === "create-contact") run = api(state, "POST", "/api/contacts", form);
    if (action === "create-opportunity") run = api(state, "POST", "/api/opportunities", Object.assign({}, form, { amountCents: form.amountCents ? Number(form.amountCents) : undefined }));
    if (action === "create-stage") run = api(state, "POST", "/api/pipeline-stages", Object.assign({}, form, { probability: form.probability ? Number(form.probability) : undefined }));
    if (action === "archive-account") run = api(state, "DELETE", "/api/accounts/" + encodeURIComponent(id));
    if (action === "archive-contact") run = api(state, "DELETE", "/api/contacts/" + encodeURIComponent(id));
    if (action === "archive-opportunity") run = api(state, "DELETE", "/api/opportunities/" + encodeURIComponent(id));
    if (action === "export-audience") {
      run = api(state, "POST", "/api/audience-export", {}).then(function(result) {
        state.audience = result.rows || [];
        state.tab = "audience";
        renderShell(state);
      });
    }
    if (!run) return;
    Promise.resolve(run).then(function() {
      state.form = {};
      return refresh(state);
    }).catch(function(error) {
      setStatus(state, error.message);
    });
  }

  function renderShell(state) {
    state.container.innerHTML = [
      '<div class="txcrm-root"><div class="txcrm-shell">',
      '<aside class="txcrm-side">',
      '<h1 class="txcrm-brand">TribeX CRM</h1>',
      '<div class="txcrm-context">',
      '<label><div class="txcrm-label">API</div><input class="txcrm-input" data-role="api-base" value="' + esc(state.apiBase) + '"></label>',
      '<label><div class="txcrm-label">Org</div><input class="txcrm-input" data-role="org" value="' + esc(state.organizationId) + '"></label>',
      '<label><div class="txcrm-label">User</div><input class="txcrm-input" data-role="user" value="' + esc(state.userId) + '"></label>',
      '</div>',
      '<nav class="txcrm-tabs">',
      tabs.map(function(tab) { return '<button class="txcrm-tab" aria-selected="' + (state.tab === tab) + '" data-tab="' + esc(tab) + '">' + esc(tab.charAt(0).toUpperCase() + tab.slice(1)) + '</button>'; }).join(""),
      '</nav>',
      '</aside>',
      '<section class="txcrm-main" data-role="main"></section>',
      '</div></div>'
    ].join("");
    state.container.querySelectorAll("[data-tab]").forEach(function(button) {
      button.addEventListener("click", function() {
        state.tab = button.getAttribute("data-tab");
        state.form = {};
        renderShell(state);
      });
    });
    state.container.querySelector("[data-role=api-base]").addEventListener("change", function(event) {
      state.apiBase = event.target.value.replace(/\/$/, "");
      refresh(state);
    });
    state.container.querySelector("[data-role=org]").addEventListener("change", function(event) {
      state.organizationId = event.target.value;
      refresh(state);
    });
    state.container.querySelector("[data-role=user]").addEventListener("change", function(event) {
      state.userId = event.target.value;
      refresh(state);
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
