# Setup

## Install Dependencies

From the repo root:

```bash
npm install
```

## Attach to a Project

Use `attach-repo` when a specific project should get its own agent files.

Codex:

```bash
node bin/agent-workbench.js attach-repo \
  --repo /path/to/project \
  --target codex \
  --profile spec-driven \
  --mode copy
```

Claude Code:

```bash
node bin/agent-workbench.js attach-repo \
  --repo /path/to/project \
  --target claude \
  --profile spec-driven \
  --mode copy
```

## Install Globally

Use `sync-global` when your user account should get reusable global assets.

```bash
node bin/agent-workbench.js sync-global --dry-run
node bin/agent-workbench.js sync-global
node bin/agent-workbench.js doctor-global
```

This writes guidance under `~/.codex`, `~/.claude`, and `~/.gemini`; copies shared skills into `~/.agents/skills`; and copies Claude assets into `~/.claude`.

## Sync Dotfiles

Review the allowlisted dotfile sync before applying it:

```bash
node bin/agent-workbench.js sync-dotfiles --dry-run
node bin/agent-workbench.js doctor-dotfiles
```

## Check an Install

```bash
node bin/agent-workbench.js doctor --repo /path/to/project --target codex
node bin/agent-workbench.js doctor --repo /path/to/project --target claude
```

`doctor` checks expected project files, missing spec folders, broken symlinks, and obvious secret patterns.

## Install Modes

- `copy`: project or user config owns the generated files.
- `symlink`: project config points back to Workbench source files when explicitly requested.
- `render`: config files are generated from adapter templates.

Global sync uses `copy` by default.
