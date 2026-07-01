# Security Baseline

- Never commit real secrets, tokens, private keys, or credentials.
- Use environment variable names and examples instead of real values.
- Ask before adding new network-facing behavior, auth logic, or dependency supply-chain risk.
- Preserve existing permission boundaries.
- Treat `.env`, SSH keys, cloud credentials, and local config files as protected.
- Do not weaken auth, authorization, validation, or sandbox boundaries without explicit approval.
- Treat dependency additions as security-relevant changes.
