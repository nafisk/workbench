---
name: sdd-design
description: Create design.md after requirements are approved. Stop after design and request approval.
---

# SDD Design

Before writing design:

- Confirm `state.yaml` has `approved.requirements: true`.
- If not approved, stop and ask for requirements approval.

Create `specs/<feature-slug>/design.md`.

Include:

- Overview
- Affected areas
- Data flow
- Interfaces
- Error handling
- Testing strategy
- Risks and tradeoffs

Update `state.yaml`:

- `phase: design_review`
- `approved.design: false`

Do not create tasks or implement code. End by asking the user to approve or revise the design.
