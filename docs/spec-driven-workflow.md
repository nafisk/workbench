# Spec-Driven Workflow

Agent Workbench includes a small Kiro-like spec workflow.

## Flow

```text
requirements -> approval -> design -> approval -> tasks -> approval -> implementation
```

Implementation happens one task at a time.

## Files

Each feature spec should live in the target project:

```text
specs/<feature-slug>/
  requirements.md
  design.md
  tasks.md
  verification.md
  state.yaml
```

## Skills

The workflow is split into focused skills:

- `sdd-orchestrator`
- `sdd-create`
- `sdd-design`
- `sdd-tasks`
- `sdd-implement`
- `sdd-verify`

Use `sdd-orchestrator` for natural language flow control.

## Example Prompt

In Codex:

```text
$sdd-orchestrator Create a spec for adding GitHub login.
```

Or:

```text
Create a spec for adding GitHub login using the spec-driven workflow. Stop after requirements and ask me to approve before design.
```

## Approval Gates

The agent should stop after:

- requirements
- design
- tasks

The user must approve each phase before the next phase starts.
