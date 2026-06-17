import { defineMcpClientConnection } from "eve/connections";

/**
 * Floe spend control for the `fetcher` subagent — its OWN key, so it has its own
 * budget cap independent of the lead (mapping A). Holds one secret only; never a
 * provider/vendor key. All traffic goes to mcp.floelabs.xyz → credit-api.floelabs.xyz.
 */
export default defineMcpClientConnection({
  url: "https://mcp.floelabs.xyz/mcp",
  description:
    "Floe: pay x402 APIs from this subagent's capped budget, and read its spend advisory.",
  auth: {
    getToken: async () => {
      const token = process.env.FLOE_FETCHER_KEY?.trim(); // trim copy-paste whitespace
      if (!token) {
        throw new Error(
          "FLOE_FETCHER_KEY is not set. Create a second agent key (with its own cap) " +
            "at https://dev-dashboard.floelabs.xyz",
        );
      }
      return { token };
    },
  },
});
