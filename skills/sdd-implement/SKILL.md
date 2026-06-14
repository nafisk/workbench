---
name: sdd-implement
description: Implement exactly one approved task from tasks.md, then verify and update task state.
---

# SDD Implement

Before implementation:

- Confirm requirements, design, and tasks are approved in `state.yaml`.
- Pick exactly one unchecked task from `tasks.md`.
- If no approved task exists, stop and ask for approval or clarification.

Implementation rules:

- Keep changes scoped to the selected task.
- Do not opportunistically implement later tasks.
- Run the verification listed for the task when feasible.
- Update the task checkbox only after verification.
- Update `verification.md` with evidence.
- Update `state.yaml` with `current_task` and history.

End by summarizing the task completed, verification run, and remaining tasks.
