import { defineMcpClientConnection } from "eve/connections";

/**
 * Floe spend control for an Eve agent.
 *
 * Drop this file at `agent/connections/floe.ts` — or under any subagent at
 * `agent/subagents/<id>/connections/floe.ts` to give that subagent its own
 * capped budget. Set `FLOE_AGENT_KEY` in your env; that is the ONLY secret the
 * agent holds. It never touches provider/vendor keys — all spend flows through
 * Floe's proxy, which enforces your budget cap server-side.
 *
 * Get a key and set a budget cap at the dashboard:
 *   https://dev-dashboard.floelabs.xyz/?utm_source=eve&utm_medium=connection&utm_campaign=eve-floe
 */
export default defineMcpClientConnection({
  url: "https://mcp.floelabs.xyz/mcp",
  description:
    "Floe: pay any x402 API from a capped prepaid budget, and read the agent's spend budget/advisory.",
  auth: {
    getToken: async () => {
      const token = process.env.FLOE_AGENT_KEY?.trim(); // trim copy-paste whitespace
      if (!token) {
        throw new Error(
          "FLOE_AGENT_KEY is not set. Create an agent key (and a budget cap) at " +
            "https://dev-dashboard.floelabs.xyz",
        );
      }
      return { token };
    },
  },
});
