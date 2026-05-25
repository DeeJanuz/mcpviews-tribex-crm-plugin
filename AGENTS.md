# Plugin Workflow

- Keep renderer state in the browser and persistence in the `tribex-crm` service.
- Keep the plugin bridge thin: open renderer, normalize rows, and proxy service API calls.
- Use `npm test` and `npm run check` before packaging.
- Do not add a second CRM database or durable plugin-local storage layer.
