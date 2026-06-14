---
name: sdd-tasks
description: Create tasks.md after design is approved. Stop after task planning and request approval.
---

# SDD Tasks

Before writing tasks:

- Confirm requirements are approved.
- Confirm design is approved.
- If either is not approved, stop and ask for the missing approval.

Create `specs/<feature-slug>/tasks.md`.

Task rules:

- Each task must be independently reviewable.
- Each task must reference requirements or criteria.
- Each task must include expected outcome, likely files, dependencies, and verification.
- Keep tasks small enough for one implementation pass.

Update `state.yaml`:

- `phase: tasks_review`
- `approved.tasks: false`

Do not implement code. End by asking the user to approve or revise the task plan.
