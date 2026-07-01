# Workbench

<p>
  <img alt="Codex" src="https://img.shields.io/badge/Codex-managed-2563eb?style=flat-square">
  <img alt="Claude Code" src="https://img.shields.io/badge/Claude_Code-managed-7c3aed?style=flat-square">
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-guidance-16a34a?style=flat-square">
  <img alt="Sync" src="https://img.shields.io/badge/sync-copy_based-f97316?style=flat-square">
</p>

Personal source of truth for dotfiles and AI agent harness setup.

Workbench keeps approved files in one repo, then copies or renders them into the layout each tool expects.

> [!NOTE]
> Global agent sync is copy-based. Dotfile sync should always be reviewed with `--dry-run` before applying.

## What It Manages

| Area | What lives here |
| --- | --- |
| Agent setup | Guidance, skills, Claude commands, and spec templates |
| Dotfiles | Approved home and `.config` files mirrored under `dotfiles/home` |
| Sync tooling | CLI commands for dry-runs, live sync, and doctor checks |

## Quick Start

```bash
npm install
npm test
node bin/agent-workbench.js sync-global --dry-run
node bin/agent-workbench.js sync-dotfiles --dry-run
```

Apply agent harness files after reviewing the dry run:

```bash
node bin/agent-workbench.js sync-global
node bin/agent-workbench.js doctor-global
```

## Directory Map

| Directory | Purpose |
| --- | --- |
| `adapters/` | Tool-specific guidance templates |
| `core/` | Shared operating guidance |
| `dotfiles/` | Approved dotfiles mirror and sync manifest |
| `profiles/` | Install bundles |
| `skills/` | Reusable agent workflows |
| `specs/` | Spec-driven templates |
| `src/` | Sync CLI |
| `test/` | Node test suite |

## Docs

- [Motivation and layout](docs/motivation-and-layout.md)
- [Setup](docs/setup.md)
- [Tool layouts](docs/tool-layouts.md)
- [Spec-driven workflow](docs/spec-driven-workflow.md)

## Safety

No secrets belong in this repo. Keep credentials, app caches, databases, logs, sockets, and generated runtime state out of Git.
