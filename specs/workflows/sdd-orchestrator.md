# SDD Orchestrator Workflow

Use this workflow when the user asks to create, continue, approve, revise, implement, or verify a spec.

Phases:

1. `requirements_review`
2. `design_review`
3. `tasks_review`
4. `implementation`
5. `verification`
6. `complete`

Rules:

- Read `specs/<feature>/state.yaml` before deciding the next action.
- If no spec exists, create requirements first.
- Do not create design before requirements approval.
- Do not create tasks before design approval.
- Do not implement before tasks approval.
- Implement one task at a time.
- Update `state.yaml` and `tasks.md` after every phase change.
- Stop and ask for user approval at every review phase.
