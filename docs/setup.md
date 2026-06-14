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

Use `install` when your user account should get reusable global assets.

Codex:

```bash
node bin/agent-workbench.js install \
  --target codex \
  --profile spec-driven \
  --mode symlink
```

This writes guidance under `~/.codex` and links skills into `~/.agents/skills`.

Claude Code:

```bash
node bin/agent-workbench.js install \
  --target claude \
  --profile spec-driven \
  --mode symlink
```

This writes guidance and links skills under `~/.claude`.

## Check an Install

```bash
node bin/agent-workbench.js doctor --repo /path/to/project --target codex
node bin/agent-workbench.js doctor --repo /path/to/project --target claude
```

`doctor` checks expected files, missing spec folders, broken symlinks, and obvious secret patterns.

## Install Modes

- `copy`: project owns the generated files.
- `symlink`: project or user config points back to Agent Workbench source files.
- `render`: config files are generated from adapter templates.

Use `copy` for work repos. Use `symlink` for personal global setup.
