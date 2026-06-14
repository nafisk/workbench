# Hooks

## Purpose
Tool-event automation and guardrails.

## What Belongs Here
Pre-tool, post-tool, session-start, stop, and compaction scripts or configs.

## What Does Not Belong Here
Secrets, broad MCP configs, or rules that only need to be text guidance.

## Portability
Hooks are target-specific. Codex and Claude hook schemas are not treated as interchangeable.

## Provenance
Hook sources must be tracked when imported or adapted.

## Install Behavior
Render target-specific hook config. Copy scripts only after review.

## Examples
`codex/hooks.json`, `claude/settings.json` hook entries.
