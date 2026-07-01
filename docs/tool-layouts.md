# Tool Layouts

Codex, Claude Code, and Gemini share source assets, but they do not use the same install paths.

## Shared Source

```text
workbench/
  core/
  skills/sdd-create/
  skills/sdd-design/
  adapters/claude/commands/
  specs/templates/
```

## Codex User Install

```text
~/.codex/
  AGENTS.md
  config.toml
  hooks.json

~/.agents/
  skills/
    sdd-create/
    sdd-design/
```

Codex reads user skills from `~/.agents/skills`.

## Claude User Install

```text
~/.claude/
  CLAUDE.md
  settings.json
  skills/
    sdd-create/
    sdd-design/
  commands/
```

Claude Code reads user skills from `~/.claude/skills`.

## Codex Project Attach

```text
your-project/
  AGENTS.md
  .agents/
    skills/
  .codex/
    config.toml
    hooks.json
  specs/
    templates/
```

## Claude Project Attach

```text
your-project/
  CLAUDE.md
  .claude/
    skills/
    commands/
    settings.json
  specs/
    templates/
```

## Gemini User Install

```text
~/.gemini/
  GEMINI.md
```

## Why Not One Shared Folder?

One shared source folder is fine. One shared install folder is not reliable because each tool has its own discovery rules.

The stable model is:

```text
workbench source -> adapter -> tool-specific install path
```
