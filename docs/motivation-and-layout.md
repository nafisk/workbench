# Motivation and Layout

Workbench exists to make local setup easier to trust.

Before this repo, dotfiles, agent skills, Claude commands, and tool-specific config lived in different places. Codex, Claude, Gemini, and shared agent workflows each expect their own directory shape. That makes it easy for files to drift, break after a rename, or become hard to audit.

This repo keeps the approved source files in one place, then copies them into the layout each tool expects.

## Goals

- Keep one clear source of truth for agent workflows and selected dotfiles.
- Avoid symlinks for global installs.
- Use dry-run commands before overwriting local files.
- Keep each harness in its native file structure.
- Make it obvious which files are managed and which are not.
- Keep secrets, tokens, local caches, and runtime state out of Git.

## How Sync Works

The repo stores canonical files. The CLI copies or renders those files into live locations:

```text
workbench/
  source files
      |
      v
sync commands
      |
      v
~/.codex, ~/.agents, ~/.claude, ~/.gemini, ~/.config, and selected home files
```

Agent harness sync is applied with:

```bash
node bin/agent-workbench.js sync-global --dry-run
node bin/agent-workbench.js sync-global
node bin/agent-workbench.js doctor-global
```

Dotfile sync should be reviewed first:

```bash
node bin/agent-workbench.js sync-dotfiles --dry-run
node bin/agent-workbench.js doctor-dotfiles
```

## Directory Guide

| Directory | Purpose |
| --- | --- |
| `adapters/` | Tool-specific guidance templates and adapter-owned assets, including Claude commands. |
| `core/` | Shared operating guidance used across tools. |
| `docs/` | Human-readable notes about the repo, setup, design, and layout. |
| `dotfiles/` | Approved dotfiles mirror plus `manifest.yaml`, the allowlist used by dotfile sync. |
| `profiles/` | Bundles of assets to install together, such as the spec-driven profile. |
| `skills/` | Reusable agent workflows copied into the harness skill directories. |
| `specs/` | Spec-driven development templates and workflow state patterns. |
| `src/` | Node CLI implementation for rendering, syncing, and doctor checks. |
| `test/` | Node test suite for the CLI and sync behavior. |

## Live Locations

| Location | Managed Content |
| --- | --- |
| `~/.codex/AGENTS.md` | Rendered Codex guidance. |
| `~/.agents/skills` | Shared skills for Codex and other agent tools. |
| `~/.claude/CLAUDE.md` | Rendered Claude Code guidance. |
| `~/.claude/skills` | Claude-local copies of managed skills. |
| `~/.claude/commands` | Claude command prompts. |
| `~/.gemini/GEMINI.md` | Rendered Gemini guidance. |
| selected `~/.config/...` paths | Dotfiles listed in `dotfiles/manifest.yaml`. |

## What Does Not Belong Here

- Real secrets, API tokens, SSH keys, or credential files.
- App caches, databases, logs, sockets, and lock files.
- Tool runtime folders that are regenerated automatically.
- Dotfiles that have not been explicitly approved for management.

## Current Scope

Workbench currently manages the approved agent harness files and selected dotfiles. Kiro and Neofetch are intentionally not tracked.
