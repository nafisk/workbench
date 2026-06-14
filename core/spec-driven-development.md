# Spec-Driven Development

For substantial features or risky bug fixes, use the gated spec workflow:

1. Create or update `specs/<feature>/requirements.md`.
2. Stop for user approval.
3. Create or update `specs/<feature>/design.md`.
4. Stop for user approval.
5. Create or update `specs/<feature>/tasks.md`.
6. Stop for user approval.
7. Implement one task at a time.
8. Verify after each task and update `tasks.md` plus `state.yaml`.

Acceptance criteria should use EARS-style language:

```text
WHEN <condition or event>
THE SYSTEM SHALL <observable behavior>
```

Do not skip approval gates unless the user explicitly asks to bypass the workflow for the current spec.
