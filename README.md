# Agent Workbench

A central repo for reusable AI coding agent setup.

Agent Workbench keeps shared agent assets in one place, then installs or renders them into the layout each tool expects. v0.1 supports **Codex** and **Claude Code**.

## What It Manages

- Skills
- Rules
- Commands
- Spec-driven development templates
- Codex and Claude adapters
- MCP placeholders
- Install profiles
- Doctor checks

## Quick Start

Install dependencies:

```bash
npm install
```

Attach the spec-driven setup to a Codex project:

```bash
node bin/agent-workbench.js attach-repo \
  --repo /path/to/project \
  --target codex \
  --profile spec-driven \
  --mode copy
```

Attach the same setup to a Claude Code project:

```bash
node bin/agent-workbench.js attach-repo \
  --repo /path/to/project \
  --target claude \
  --profile spec-driven \
  --mode copy
```

Check an attached project:

```bash
node bin/agent-workbench.js doctor --repo /path/to/project --target codex
node bin/agent-workbench.js doctor --repo /path/to/project --target claude
```

## Repository Structure

```text
agent-workbench/
  README.md              # Project overview
  registry.yaml          # Asset catalog
  package.json           # Node CLI package metadata

  core/                  # Shared principles and global behavior
  skills/                # Reusable workflows
  rules/                 # Always-on constraints
  commands/              # User-invoked command prompts
  specs/                 # Spec-driven templates and workflow docs
  adapters/              # Codex, Claude, and future tool mappings
  profiles/              # Install bundles
  mcp/                   # MCP placeholders and profiles
  hooks/                 # Future hook assets
  agents/                # Future specialist agents
  prompts/               # Draft prompt fragments
  templates/             # Shared render templates
  scripts/               # CLI wrapper scripts
  src/                   # Node CLI implementation
  test/                  # Node test suite
  evals/                 # Manual workflow smoke tests
  examples/              # Example installed project layouts
  docs/                  # Setup and design documentation
```

## Docs

- [Setup](docs/setup.md)
- [Concepts](docs/concepts.md)
- [Tool layouts](docs/tool-layouts.md)
- [Spec-driven workflow](docs/spec-driven-workflow.md)
- [Adapter compatibility](docs/adapter-compatibility.md)

## Current Scope

v0.1 is intentionally small:

- Codex and Claude Code are implemented targets.
- Kiro, Cursor, and OpenCode are documented as future targets.
- The built-in SDD workflow is custom and kept separate from OSS frameworks.
- MCP entries are placeholders only. No secrets belong in this repo.

## Test

```bash
npm test
```
