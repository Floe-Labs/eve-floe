import { defineSchedule } from "eve/schedules";

/**
 * Unattended daily run. No human watches a scheduled job, so the safety here is
 * structural, not vibes:
 *   - the agent's Floe budget cap is the hard backstop — a runaway scheduled run
 *     cannot spend past it (over-budget x402 payments are refused);
 *   - the budget-aware skill makes the agent taper as it nears the cap;
 *   - wire an operator `near_limit` alert (Floe credit-threshold webhook) so a
 *     human gets pinged before the cap is hit. See docs/UNATTENDED-AND-ALERTS.md.
 */
export default defineSchedule({
  cron: "0 13 * * 1-5", // weekdays, 13:00 UTC
  markdown:
    "Run the daily market-research digest: pick one trending topic, gather a few " +
    "sources via the fetcher, and produce a short sourced brief — staying within budget.",
});
