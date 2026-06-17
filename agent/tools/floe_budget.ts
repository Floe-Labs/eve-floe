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

    // Hardcoded host: the agent key must only ever go to Floe's API. No env
    // override — that would be a bearer-token-exfiltration path and contradicts
    // SECURITY.md (all Floe traffic → credit-api.floelabs.xyz).
    const res = await fetch("https://credit-api.floelabs.xyz/v1/agents/credit-remaining", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000), // don't let a hang stall an unattended run
    });
    if (!res.ok) throw new Error(`Floe budget check failed: HTTP ${res.status}`);

    const b = (await res.json()) as {
      headroomToAutoBorrow?: string;
      sessionSpendRemaining?: string | null;
      utilizationBps?: number;
    };

    // Validate before trusting — bad upstream values must not silently become NaN.
    const usd = (v: string | null | undefined, field: string): number | null => {
      if (v == null) return null;
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${field} from Floe`);
      return n / 1e6;
    };
    const headroom = usd(b.headroomToAutoBorrow ?? "0", "headroomToAutoBorrow") ?? 0;
    const session = usd(b.sessionSpendRemaining, "sessionSpendRemaining");
    const remainingUsd = session == null ? headroom : Math.min(headroom, session);

    const usedBps = b.utilizationBps ?? 0;
    if (!Number.isFinite(usedBps) || usedBps < 0 || usedBps > 10000) {
      throw new Error("Invalid utilizationBps from Floe");
    }

    return {
      remaining_usd: Number(remainingUsd.toFixed(6)),
      used_bps: usedBps,
      near_limit: usedBps >= 8000, // ≥ 80% used
    };
  },
});
