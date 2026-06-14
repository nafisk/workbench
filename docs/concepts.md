# Concepts

## Source Once, Install Per Tool

Agent Workbench keeps canonical assets in one repo:

```text
skills/
rules/
commands/
specs/templates/
core/
```

Codex and Claude do not read all the same paths, so the CLI installs or renders those assets into each tool's expected layout.

## Profiles

Profiles are install bundles.

Examples:

- `minimal`: basic principles, security, testing, and git workflow.
- `spec-driven`: default SDD workflow with skills and templates.
- `work`: stricter work-oriented profile placeholder.

Profiles are not model provider settings.

## Skills

Skills are reusable workflows.

Example:

```text
skills/sdd-create/SKILL.md
```

The same source skill can be linked into both:

```text
~/.agents/skills/sdd-create
~/.claude/skills/sdd-create
```

## Rules

Rules are durable constraints.

Examples:

- Do not commit secrets.
- Verify before marking a task complete.
- Keep final summaries tied to the approved spec.

Rules are not step-by-step workflows.

## Specs

The `specs/` folder in Agent Workbench contains templates and workflow instructions.

Active product specs belong in the target project:

```text
your-project/specs/<feature>/
  requirements.md
  design.md
  tasks.md
  verification.md
  state.yaml
```

## Registry

`registry.yaml` records what each asset is, where it lives, which targets can use it, and whether it is custom, adapted, external, or generated.
