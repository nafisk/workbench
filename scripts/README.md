# Scripts

## Purpose
Convenience wrappers around the Node CLI.

## What Belongs Here
Small executable entry points for install, attach, render, doctor, and uninstall.

## What Does Not Belong Here
Core CLI logic. Keep that in `src/`.

## Portability
Shell wrappers may be platform-specific. The Node CLI is the canonical interface.

## Provenance
Scripts are custom.

## Install Behavior
Run locally from the repo or through the package bin.

## Examples
`install`, `attach-repo`, `render`, `doctor`.
