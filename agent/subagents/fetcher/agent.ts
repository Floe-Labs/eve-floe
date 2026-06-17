import { defineAgent } from "eve";

/**
 * Fetcher subagent. Pays x402 APIs (search/scrape) through Floe to gather
 * sources. It has its OWN Floe key (FLOE_FETCHER_KEY) and therefore its own,
 * smaller budget cap — independent of the lead's. Both caps (this agent's and
 * the developer-wide one) are enforced on every payment.
 */
export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
  description:
    "Fetches web pages and search results by paying x402 APIs through Floe, " +
    "strictly within its own capped budget. Delegate URL/search fetching here.",
});
