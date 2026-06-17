# U0 — Eve × Floe integration spike (findings)

Verified against [eve.dev/docs](https://eve.dev/docs) and a live probe of Floe's
remote MCP. This is the contract the rest of the units (U1–U5) build against — so
we don't code against guessed Eve internals.

## Verdicts

| Integration point | Verdict | What we found |
|---|---|---|
| **(i) MCP connection + auth** | 🟢 Green | Eve `defineMcpClientConnection({ url, auth: { getToken } })` sends `Authorization: Bearer <token>`; `getToken` reads from env/secrets. Floe's MCP is live at `https://mcp.floelabs.xyz/mcp` — **Streamable HTTP, Bearer-authed** (POST→401 unauth; `Mcp-Session-Id`/`Authorization` in CORS). Eve requires Streamable HTTP or SSE → matches. **Use the remote MCP, not the stdio npm package.** |
| **(ii) per-subagent keys** | 🟢 Green | Declared subagents live in `agent/subagents/<id>/` and **inherit nothing** from the root — each owns its `connections/`, tools, skills, sandbox. So each subagent gets its own `connections/floe.ts` reading its own key env. Parallel ("fan out") is supported. Mapping **A** (per-subagent Floe key) is fully achievable. |
| **(iii) durable step/run id in tool ctx** | 🟡 Amber | `execute(input, ctx)` — `ctx` exposes `session` (turn, auth, parent lineage), `getSandbox()`, `getSkill()`. **No explicit run/step/workflow id documented.** Idempotency keyed on a stable id (U4) must come from `ctx.session` (turn/lineage) **and** be verified to survive a durable replay — otherwise cross-replay idempotency is a documented gap. |
| **(iv) custom model base URL** | 🔴 Red (simple path) | `model` is a gateway string (`"anthropic/claude-opus-4.8"`) **or** a provider-authored `LanguageModel` object. **No documented `baseURL`.** Option (b) full-LLM metering via Floe's `/v1/llm` is **not** available through the model-id string. *Maybe* possible by passing a custom AI-SDK provider object (`createOpenAI({ baseURL })(...)`) as `model` — unverified, and **not pursued** (see Decisions: option (b) is dropped). |

## Verified config (what U1/U2 will use)

```ts
// agent/connections/floe.ts  (and one per subagent under agent/subagents/<id>/connections/)
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "https://mcp.floelabs.xyz/mcp",            // Streamable HTTP, verified live
  description: "Floe: pay any x402 API and read the spend budget/advisory.",
  auth: {
    getToken: async () => {
      const token = process.env.FLOE_AGENT_KEY;
      if (!token) throw new Error("Missing FLOE_AGENT_KEY");
      return { token };
    }, // the one secret for this (sub)agent
  },
});
```

- Each **(sub)agent** holds **one** secret: `FLOE_AGENT_KEY` (`floe_…`) — its own
  key per subagent (mapping A). No provider/vendor keys.
- Tools reach Floe **only** through `mcp.floelabs.xyz` → `credit-api.floelabs.xyz`.

## Impact on the plan

(See **Decisions (ratified)** below — that section is the source of truth where it differs.)

- **U1 (MCP connection):** 🟢 proceed — target `https://mcp.floelabs.xyz/mcp` with `getToken`.
- **U2 (template + per-subagent caps):** 🟢 proceed — mapping A confirmed (per-subagent `connections/floe.ts` + per-subagent key env).
- **U3 (budget-aware skill + advisory):** 🟢 proceed — skills supported; advisory read via the MCP tool.
- **U4 (replay-safe metering + alert):** 🟡 **split.** Operator `near_limit` alert is green. Idempotency is **document-the-gap, no micro-spike** (see Decisions) — replays shouldn't re-pay, the proxy dedups retries in its window, best-effort `Idempotency-Key` from `ctx.session`.
- **U5 (defineTool):** 🟢 only if the raw MCP path is clumsy; `ctx` (session/sandbox/skill) + `process.env` available.
- **Option (b) LLM metering:** **dropped** from the Eve play (see Decisions) — AI Gateway owns the model plane; Floe complements it on the vendor plane.

## Decisions (ratified)

- **U4 — idempotency: document the gap, don't block.** Ship the operator `near_limit`
  alert (the load-bearing value). Durable replays shouldn't re-pay (Vercel Workflow
  SDK journals step results — assumption, not doc-confirmed); the proxy dedups
  retries within its own window; pass any stable `ctx.session` id as a best-effort
  `Idempotency-Key`. A deterministic per-call key is a fast-follow *only if* a real
  double-charge is observed. No runtime micro-spike gating the unit.
- **Option (b) — LLM-plane metering: dropped from the Eve play (not deferred).**
  Eve routes models through Vercel **AI Gateway**; proxying LLM spend through Floe
  would compete with Vercel on its own turf and is brittle (no `baseURL` hook).
  Positioning instead: **Floe governs the vendor/API plane; AI Gateway owns the
  model plane; together = complete spend control.** v1 = (a) hard cap on the tool
  plane + (c) advisory.
