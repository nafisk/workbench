---
name: sdd-orchestrator
description: Use when the user asks to create or continue a Kiro-like spec-driven workflow. Orchestrates requirements, design, tasks, implementation, and verification with approval gates.
---

# SDD Orchestrator

Follow `specs/workflows/sdd-orchestrator.md`.

When invoked:

1. Determine the feature slug from the request or the existing `specs/*/state.yaml`.
2. Read the current state if it exists.
3. Route to the correct phase:
   - no spec: create requirements
   - `requirements_review`: wait for approval or revise requirements
   - `design_review`: wait for approval or revise design
   - `tasks_review`: wait for approval or revise tasks
   - `implementation`: implement exactly one unchecked approved task
   - `verification`: verify against requirements and tasks
4. Never skip a review gate unless the user explicitly says to bypass gates for this spec.
5. After each phase, update `state.yaml`.
6. Stop after producing review artifacts and ask for approval.

Approval phrases include:

- approve requirements
- approve design
- approve tasks
- approve and continue

If approval is ambiguous, ask a single direct question.
