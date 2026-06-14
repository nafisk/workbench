# Skills

## Purpose
Reusable task workflows that agents can invoke directly or implicitly.

## What Belongs Here
Focused workflows with a `SKILL.md`, such as spec creation, design, task planning, implementation, verification, review, or debugging.

## What Does Not Belong Here
Always-on rules, project facts, secrets, or tool configuration.

## Portability
Codex uses `.agents/skills`. Claude Code uses `.claude/skills`.

## Provenance
Each skill must be tracked in `registry.yaml` as custom, adapted, external, or generated.

## Install Behavior
Symlink for personal installs; copy for project-owned installs.

## Examples
`sdd-orchestrator`, `sdd-create`, `sdd-design`, `sdd-tasks`, `sdd-implement`, `sdd-verify`.
