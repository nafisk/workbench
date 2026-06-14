# MCP

## Purpose
Model Context Protocol server definitions and profile groupings.

## What Belongs Here
Server metadata, command templates, URL templates, and env var placeholders.

## What Does Not Belong Here
Real API keys, private tokens, personal credentials, or unreviewed server code.

## Portability
Codex and Claude both support MCP, but config shapes differ.

## Provenance
External MCP servers should include source URLs and license notes.

## Install Behavior
Render target-specific config files from placeholders.

## Examples
`servers/github.yaml`, `servers/playwright.yaml`, `profiles/work.yaml`, `env.example`.
