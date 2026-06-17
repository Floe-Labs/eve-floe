# Add Floe spend control to any Eve agent

Give your Eve agent a **hard budget cap** and the ability to **pay any x402 API**
from a prepaid balance — without handing it a single provider or vendor key.

## Two steps

**1. Drop in the connection.** Copy [`connections/floe.ts`](../connections/floe.ts)
into your agent at `agent/connections/floe.ts`. (For a subagent with its own
budget, copy it to `agent/subagents/<id>/connections/floe.ts` — subagents inherit
nothing, so each gets its own cap.)

**2. Set one secret.** Create an agent key and a budget cap at the
[Floe dashboard](https://dev-dashboard.floelabs.xyz/?utm_source=eve&utm_medium=docs&utm_campaign=eve-floe),
then set it in your env:

```bash
FLOE_AGENT_KEY=floe_xxxxxxxxxxxxxxxx
```

That's it. The agent now has Floe tools (pay an x402 API, read its budget/advisory),
and every payment is checked against your cap **server-side** before it settles.

## What your agent can (and can't) do

- ✅ Pay any of 2,000+ x402 APIs from a **prepaid, capped** balance.
- ✅ Read its **budget advisory** (how close it is to the cap) and taper.
- 🔒 Holds **one** secret (`FLOE_AGENT_KEY`) — never a provider/vendor key. All
  traffic goes to `mcp.floelabs.xyz` → `credit-api.floelabs.xyz`, nowhere else.
- 🧱 Can't spend past the cap: over-budget calls are refused before they pay.

> **Scope (honest):** Floe hard-caps what your agent **pays vendors/APIs**. Your
> **model** spend is governed by Vercel **AI Gateway** — the two are complementary
> (Floe = vendor/API plane, AI Gateway = model plane).

## Manual acceptance checklist

This package type-checks against `eve` (run `npm run typecheck`), but the live
flow needs your Eve env + a funded Floe key. Verify:

- [ ] `eve dev` starts and the Floe connection registers (its tools are listed).
- [ ] With `FLOE_AGENT_KEY` set, the agent calls a Floe tool and auth succeeds.
- [ ] With `FLOE_AGENT_KEY` **unset**, the connection fails with the clear
      "FLOE_AGENT_KEY is not set" error (no silent fallback).
- [ ] A call that would exceed the budget cap is **refused** (not paid).
- [ ] No provider/vendor key is configured for Floe anywhere; outbound Floe
      traffic hits only `mcp.floelabs.xyz` / `credit-api.floelabs.xyz`.
