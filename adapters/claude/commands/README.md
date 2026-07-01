# Commands

## Purpose
Claude Code user-invoked prompts or slash commands.

## What Belongs Here
Entry points like create spec, continue spec, implement next task, review branch, and fix CI.

## What Does Not Belong Here
Long-lived guidance, project-specific decisions, or config files.

## Portability
Claude Code can consume command files. Codex and Gemini use rendered guidance and skills instead.

## Provenance
Commands are adapter-owned assets.

## Install Behavior
Copied into `~/.claude/commands` for global sync and `.claude/commands` for project attach.

## Examples
`create-spec.md`, `continue-spec.md`, `implement-next-task.md`.
