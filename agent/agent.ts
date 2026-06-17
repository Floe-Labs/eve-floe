import { defineAgent } from "eve";

/**
 * Lead agent: plans a research task and delegates paid web fetching to the
 * `fetcher` subagent. Everything it pays for runs through Floe and is capped by
 * its budget (FLOE_AGENT_KEY) — it cannot spend past the cap.
 */
export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
});
