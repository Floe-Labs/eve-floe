# Security Policy

## Supported versions

Only the latest version of `eve-floe` is supported. Please update before reporting.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report them privately by email to **security@floelabs.xyz**. If you do not get a
response, use **hello@floelabs.xyz** as a fallback contact.

Please include:

- a description of the vulnerability and its impact,
- steps to reproduce (a minimal proof of concept helps),
- the affected version/commit.

## What to expect

- We aim to acknowledge your report within **3 business days**.
- We will keep you updated on our assessment and the fix.
- Please give us a reasonable window to release a fix before public disclosure.

## A note on keys

An Eve × Floe agent should hold exactly one secret — a Floe agent key
(`FLOE_AGENT_KEY`) — and never a provider or vendor key. All Floe traffic goes to
`mcp.floelabs.xyz` / `credit-api.floelabs.xyz` only. If you find a path that leaks
the key or routes it elsewhere, please report it.
