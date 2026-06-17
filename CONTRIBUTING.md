# Contributing to eve-floe

`eve-floe` gives Vercel Eve agents a hard spend cap and budget-aware tapering via
Floe — without handing the agent any provider/vendor keys. See the README.

Contributions are welcome.

## Development setup

```bash
git clone https://github.com/Floe-Labs/eve-floe.git
cd eve-floe
npm install
npm run typecheck
```

## Contribution flow

1. Branch off `main` (e.g. `feat/your-change`).
2. Keep `npm run typecheck` green.
3. Open a **draft pull request** against `main` describing what changed and why.

## Notes

- **One secret only:** an Eve × Floe agent holds `FLOE_AGENT_KEY` and nothing else
  — never a provider/vendor key. Keep it that way.
- Floe traffic targets only `mcp.floelabs.xyz` / `credit-api.floelabs.xyz`.
- Prefer small, focused changes; keep each surface isolated (connection, template,
  skill, tool) so any one is easy to remove.
