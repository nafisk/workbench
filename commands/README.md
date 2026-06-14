# Commands

## Purpose
User-invoked prompts or slash commands.

## What Belongs Here
Entry points like create spec, continue spec, implement next task, review branch, and fix CI.

## What Does Not Belong Here
Long-lived rules, project-specific decisions, or config files.

## Portability
Claude Code can consume command files. Codex v0.1 prefers skills for reusable workflows.

## Provenance
Track commands in `registry.yaml` when they become reusable assets.

## Install Behavior
Symlink for personal Claude installs; copy for project-owned command sets.

## Examples
`create-spec.md`, `continue-spec.md`, `implement-next-task.md`.
