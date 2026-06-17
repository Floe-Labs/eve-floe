import { defineTool } from "eve/tools";
import { z } from "zod";

/**
 * floe_budget — read this agent's remaining Floe budget so it can taper before the
 * hard cap (pairs with the budget-aware skill). Reads server-side truth from Floe's
 * credit-remaining endpoint using the agent's own key. The MCP connection handles
 * *paying*; this is the focused *budget-check* primitive.
 */
export default defineTool({
  description:
    "Check this agent's remaining Floe budget (USD left, % used, whether near the " +
    "cap). Call before expensive paid work to decide whether to taper or stop.",
  inputSchema: z.object({}),
  async execute() {
    const token = process.env.FLOE_AGENT_KEY?.trim().replace(/^(["'])(.*)\1$/, "$2");
    if (!token) throw new Error("FLOE_AGENT_KEY is not set.");
    const base = (
      process.env.FLOE_API_BASE_URL?.trim() || "https://credit-api.floelabs.xyz"
    ).replace(/\/$/, "");

    const res = await fetch(`${base}/v1/agents/credit-remaining`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Floe budget check failed: HTTP ${res.status}`);

    const b = (await res.json()) as {
      headroomToAutoBorrow?: string;
      sessionSpendRemaining?: string | null;
      utilizationBps?: number;
    };
    const headroom = Number(b.headroomToAutoBorrow ?? "0") / 1e6;
    const session =
      b.sessionSpendRemaining == null ? Infinity : Number(b.sessionSpendRemaining) / 1e6;
    const remainingUsd = Math.min(headroom, session);
    const usedBps = b.utilizationBps ?? 0;

    return {
      remaining_usd: Number(remainingUsd.toFixed(6)),
      used_bps: usedBps,
      near_limit: usedBps >= 8000, // ≥ 80% used
    };
  },
});
