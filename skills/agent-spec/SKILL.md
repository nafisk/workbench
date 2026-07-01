---
name: agent-spec
description: Use when creating or continuing local Agent spec-driven development artifacts. Creates and maintains .agent/specs/<feature>/ requirements.md, design.md, tasks.md, state.agent.json, and verification.md with approval gates and one-task-at-a-time implementation.
---

# Agent Spec

Use this skill to run a local, independent Agent spec-driven workflow. It does not require a VS Code extension, external service, or bundled IDE behavior. All artifacts live in the user's project repository.

## Storage

Create specs under the active project root:

```text
.agent/specs/<feature-slug>/
  .config.agent.json
  requirements.md
  design.md
  tasks.md
  state.agent.json
  verification.md
```

Use `Agent` in prose and `.agent` in paths.

Feature slugs must be lowercase kebab-case, for example `user-authentication`.

## Config

When creating the first document for a spec, also create `.config.agent.json`:

```json
{
  "specId": "<uuid-or-timestamp-id>",
  "featureName": "<feature-slug>",
  "specType": "feature",
  "workflowType": "requirements-first",
  "createdAt": "<iso-timestamp>",
  "updatedAt": "<iso-timestamp>"
}
```

Supported `specType` values:

- `feature`
- `bugfix`

Supported `workflowType` values:

- `requirements-first`
- `design-first`
- `quick-plan`

## State

Maintain `state.agent.json`:

```json
{
  "phase": "requirements_review",
  "approved": {
    "requirements": false,
    "design": false,
    "tasks": false
  },
  "currentTask": null,
  "completedTasks": [],
  "blockedTasks": [],
  "history": []
}
```

Allowed phases:

- `requirements_review`
- `design_review`
- `tasks_review`
- `implementation`
- `verification`
- `complete`

Update `history` after every generated document, approval, implementation task, and verification attempt.

## Workflow

Default to `requirements-first` unless the user explicitly asks for a different flow.

Requirements-first flow:

1. Create or update `requirements.md`.
2. Stop and ask for approval.
3. After approval, create or update `design.md`.
4. Stop and ask for approval.
5. After approval, create or update `tasks.md`.
6. Stop and ask for approval.
7. After approval, implement exactly one task at a time.

Design-first flow:

1. Create or update `design.md`.
2. Stop and ask for approval.
3. After approval, create or update `requirements.md` from the design.
4. Stop and ask for approval.
5. After approval, create or update `tasks.md`.
6. Stop and ask for approval.
7. After approval, implement exactly one task at a time.

Quick-plan flow:

1. Ask up to 3 clarifying questions only when the prompt is ambiguous.
2. Create `requirements.md`, `design.md`, and `tasks.md`.
3. Stop and ask for approval of the plan.
4. After approval, implement exactly one task at a time.

Never skip approval gates unless the user explicitly asks to bypass gates for the current spec.

## Approval

Treat these phrases as approvals only when they clearly refer to the current phase:

- approve requirements
- requirements approved
- approve design
- design approved
- approve tasks
- tasks approved
- approve and continue
- looks good, continue

If approval is ambiguous, ask one direct question.

## Requirements Template

`requirements.md` must use this structure:

```markdown
# Requirements Document

## Introduction

[Short summary of the feature or bugfix.]

## Glossary

- **System_Name**: [Definition]

## Requirements

### Requirement 1: [Title]

**User Story:** As a [role], I want [capability], so that [benefit]

#### Acceptance Criteria

1. WHEN [event], THE [System_Name] SHALL [observable response]
2. WHILE [state], THE [System_Name] SHALL [observable response]
3. IF [undesired condition], THEN THE [System_Name] SHALL [observable response]
```

Acceptance criteria should use EARS-style patterns:

- `THE <system> SHALL <response>`
- `WHEN <trigger>, THE <system> SHALL <response>`
- `WHILE <state>, THE <system> SHALL <response>`
- `IF <condition>, THEN THE <system> SHALL <response>`
- `WHERE <option>, THE <system> SHALL <response>`
- `FOR ALL <valid inputs/states>, <property> SHALL <hold>`

Use `FOR ALL` for property-style requirements such as parser/serializer round trips, invariants, idempotence, or transformations that should hold across every valid input.

Requirements quality rules:

- Use active voice.
- Avoid vague terms such as `fast`, `simple`, `user-friendly`, `robust`, and `reasonable` unless quantified.
- Avoid pronouns when a named system or actor is clearer.
- Prefer measurable behavior.
- Keep implementation details in `design.md`, not `requirements.md`.
- Include edge cases and error behavior.

## Design Template

`design.md` must use this structure:

```markdown
# Design Document

## Overview

[Summary of the technical approach.]

## Architecture

[Components, data flow, and Mermaid diagrams when useful.]

## Components and Interfaces

[Primary modules, APIs, functions, or classes.]

## Data Models

[Types, schemas, persistence models, validation rules.]

## Correctness Properties

### Property 1: [Title]

For all [inputs/states], [property that must hold].

**Validates: Requirements X.Y**

## Error Handling

[Failure modes and system responses.]

## Testing Strategy

[Unit, integration, regression, and property-based tests when appropriate.]
```

Correctness properties are optional for UI-only, infrastructure-only, or side-effect-only work. If omitted, explain why in `Testing Strategy`.

## Tasks Template

`tasks.md` must use this structure:

````markdown
# Implementation Plan: [Feature Name]

## Overview

[Short implementation strategy.]

## Tasks

- [ ] 1. [Top-level task]
  - [ ] 1.1 [Leaf task that writes, modifies, or tests code]
    - [Concrete notes for the coding agent]
    - _Requirements: 1.1_

- [ ] 2. [Top-level task]
  - [ ] 2.1 [Leaf task]
    - _Requirements: 2.1, 2.2_

## Notes

- Keep implementation scoped to checked tasks.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] }
  ]
}
```
````

Task rules:

- Include only tasks a coding agent can perform.
- Use checkbox format.
- Use at most two hierarchy levels.
- Leaf tasks use decimal IDs like `1.1`, `2.3`.
- Prefer decimal leaf tasks for all code-writing work.
- Top-level-only tasks are allowed for setup or checkpoint tasks when no useful subtasks are needed.
- Each leaf task references requirements with `_Requirements: X.Y_`.
- Do not include deployment, training, marketing, or manual acceptance testing as implementation tasks.
- Test tasks may be marked optional as `- [ ]* 2.2 Write property tests`, but core implementation tasks must not be optional.

Task dependency graph rules:

- Every executable leaf task appears in exactly one wave.
- Top-level-only setup tasks that perform executable work may appear in the graph by top-level ID, for example `"1"`.
- Checkpoint tasks are not included in the graph unless they contain an executable leaf task.
- Wave IDs are contiguous integers starting at 0.
- Tasks in the same wave must be independent.
- Tasks that edit the same file should be in different waves.
- Later waves depend on all earlier waves.

## Validation

Before asking for approval, validate the generated document.

Requirements validation:

- Must contain `# Requirements Document`.
- Must contain `## Introduction`.
- Should contain `## Glossary`.
- Must contain `## Requirements`.
- Each requirement heading must match `### Requirement N: Title`.
- Each requirement should contain `**User Story:**`.
- Each requirement must contain `#### Acceptance Criteria`.
- Acceptance criteria should contain `SHALL`.

Design validation:

- Must contain `# Design Document`.
- Must contain `## Overview`.
- Must contain `## Architecture`.
- Must contain `## Components and Interfaces`.
- Must contain `## Data Models`.
- Should contain `## Error Handling`.
- Should contain `## Testing Strategy`.
- If `## Correctness Properties` exists, each property should include `**Validates: Requirements X.Y**`.

Tasks validation:

- Must contain `# Implementation Plan` or `# Implementation Plan: <Feature Name>`.
- Must contain `## Tasks`.
- Tasks must use checkbox format.
- Code-writing leaf tasks must use decimal IDs unless they are top-level-only setup tasks.
- Code-writing leaf tasks must include `_Requirements: X.Y_` traceability.
- Must contain `## Task Dependency Graph`.
- Dependency graph must be valid JSON with a non-empty `waves` array.
- Every executable leaf task must appear exactly once in the graph.

If validation fails, fix the document before asking for approval.

## Implementation

Before implementing any task:

1. Read `.agent/specs/<feature-slug>/requirements.md`.
2. Read `.agent/specs/<feature-slug>/design.md`.
3. Read `.agent/specs/<feature-slug>/tasks.md`.
4. Read `.agent/specs/<feature-slug>/state.agent.json`.
5. Confirm `approved.requirements`, `approved.design`, and `approved.tasks` are all `true`.
6. Select exactly one unchecked leaf task.

Implementation rules:

- Implement exactly one task per user request.
- Do not opportunistically implement later tasks.
- Keep changes minimal and scoped.
- Do not modify unrelated files.
- Run the smallest relevant verification command when feasible.
- Mark a task complete only after implementation and verification.
- If verification cannot run, record why in `verification.md` and state the remaining risk.

After implementation:

1. Update the task checkbox in `tasks.md` if verification passed or the user accepted the risk.
2. Append evidence to `verification.md`.
3. Update `state.agent.json` history and `completedTasks`.
4. Stop and summarize what changed, verification run, and the next available task.

## Verification Log

Use `verification.md`:

```markdown
# Verification Log

## <ISO timestamp> - Task <task-id>

Result: passed | failed | blocked | not-run

Command: `<command or manual check>`

Evidence:
- [Brief result]

Notes:
- [Risk, blocker, or follow-up]
```

## Continuation

When the user says `continue`, `next`, or `run next task`:

1. Locate the active spec under `.agent/specs`.
2. Read `state.agent.json`.
3. If a review phase is pending, ask for approval or requested changes.
4. If all documents are approved, implement the next ready unchecked leaf task.
5. If no tasks remain, update phase to `complete`.

When multiple specs exist and the active spec is unclear, ask the user to choose one.
