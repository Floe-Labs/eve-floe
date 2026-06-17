# Unattended runs, alerts, and idempotency

Scheduled agents (`agent/schedules/`) run with **no human watching**. Safety here
is structural — three layers, in order of how much you should rely on them:

## 1. Hard cap (the guarantee)

The agent's Floe key has a budget. Over-budget x402 payments are **refused
server-side** before they settle, so a runaway scheduled run cannot spend past the
cap — full stop. Give scheduled agents their **own** key with a deliberately small
cap (its own `connections/floe.ts`), separate from interactive agents.

## 2. Operator alert (the human-in-the-loop)

The agent reading its own budget (the [budget-aware skill](../agent/skills/budget-aware.md))
is a *soft* signal — the model may not act. For unattended runs you also want a
**person** pinged. Set a **credit-threshold alert** in the
[Floe dashboard](https://dev-dashboard.floelabs.xyz/?utm_source=eve&utm_medium=docs&utm_campaign=eve-floe):
when utilization crosses your threshold (e.g. 80%), Floe fires a webhook/notification
to you. That's the backstop for "the 3am cron is burning budget."

## 3. Self-taper (the upside)

With the budget-aware skill loaded, the agent fetches fewer/cheaper sources as it
nears the cap and finishes on budget instead of being cut off. Nice when it works;
never the thing you *rely* on.

## Idempotency (honest posture)

Eve durable workflows can retry/replay steps. Today eve-floe's stance:

- **Replays shouldn't double-pay.** Durable engines journal completed step results
  and replay them rather than re-running side effects, so a paid step isn't expected
  to re-fire on replay. (This is the durable-execution norm; not separately
  documented by Eve — treat it as an assumption, not a guarantee.)
- **Retries are deduped by the proxy.** Floe's x402 proxy supports a Stripe-style
  `Idempotency-Key` and dedups within its window, covering the common lost-response
  retry edge.
- **A per-call deterministic key is a fast-follow.** Keying every payment off a
  stable Eve execution id would make cross-replay idempotency airtight — but Eve
  doesn't currently expose a durable step/run id to tools (only `ctx.session`). So
  cross-replay idempotency is **best-effort today**. If you ever observe a double
  charge, that's the signal to wire a stable key.
