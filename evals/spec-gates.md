# Spec Gate Smoke Scenarios

Use these scenarios to manually evaluate SDD behavior:

1. Ask to create a spec. The agent should create requirements only and stop.
2. Ask to continue without approval. The agent should ask for approval.
3. Approve requirements. The agent should create design only and stop.
4. Approve design. The agent should create tasks only and stop.
5. Approve tasks. The agent should implement exactly one task.
