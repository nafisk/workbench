# Profiles

## Purpose
Install bundles for different contexts.

## What Belongs Here
YAML files that select registry assets for a specific use case.

## What Does Not Belong Here
Asset content, secrets, or target-specific render logic.

## Portability
Profiles are tool-neutral. Adapters decide how selected assets are installed.

## Provenance
Profiles are custom.

## Install Behavior
Read by `agent-workbench install`, `attach-repo`, `render`, and `doctor`.

## Examples
`minimal.yaml`, `spec-driven.yaml`, `work.yaml`.
