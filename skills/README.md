# Skills

## Purpose
Reusable task workflows that agents can invoke directly or implicitly.

## What Belongs Here
Focused workflows with a `SKILL.md`, such as spec creation, design, task planning, implementation, verification, review, or debugging.

## What Does Not Belong Here
Always-on guidance, project facts, secrets, or tool configuration.

## Portability
Codex uses `.agents/skills`. Claude Code uses `.claude/skills`.

## Provenance
Each skill must be tracked in `registry.yaml` as custom, adapted, external, or generated.

## Install Behavior
Copied into global and project-owned harness skill directories.

## Examples
`sdd-orchestrator`, `sdd-create`, `sdd-design`, `sdd-tasks`, `sdd-implement`, `sdd-verify`, `agent-spec`, `humanizer`, `ponytail`.
