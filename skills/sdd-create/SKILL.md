---
name: sdd-create
description: Create requirements.md from a natural-language feature request. Stop after requirements and request approval.
---

# SDD Create

Create `specs/<feature-slug>/requirements.md` and `specs/<feature-slug>/state.yaml`.

Requirements:

- Write user stories.
- Write acceptance criteria in EARS style.
- Include edge cases, non-goals, and open questions.
- Set `state.yaml` phase to `requirements_review`.
- Set `approved.requirements` to `false`.
- Do not create `design.md`.
- Do not create `tasks.md`.
- Do not implement code.

End by asking the user to approve or revise the requirements.
