import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { Writable } from "node:stream";
import { doctor, loadProfile, loadRegistry, renderTarget, runCli } from "../src/cli.js";

function capture() {
  let output = "";
  return {
    stream: new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      }
    }),
    output: () => output
  };
}

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "agent-workbench-test-"));
}

test("loads registry and profile yaml", () => {
  const registry = loadRegistry();
  const profile = loadProfile("spec-driven");
  assert.ok(registry.assets.length > 0);
  assert.ok(profile.assets.includes("sdd-orchestrator"));
});

test("renders Codex and Claude guidance", () => {
  const codex = renderTarget({ target: "codex", profile: "spec-driven", repo: "/tmp/example" });
  const claude = renderTarget({ target: "claude", profile: "spec-driven", repo: "/tmp/example" });
  assert.match(codex, /Agent Workbench/);
  assert.match(codex, /sdd-orchestrator/);
  assert.match(claude, /Claude Code/);
  assert.match(claude, /AGENTS\.md/);
});

test("dry-run attach-repo does not mutate destination", async () => {
  const repo = tempDir();
  const out = capture();
  const code = await runCli(["attach-repo", "--repo", repo, "--target", "codex", "--profile", "spec-driven", "--dry-run"], { stdout: out.stream });
  assert.equal(code, 0);
  assert.match(out.output(), /DRY RUN/);
  assert.equal(fs.existsSync(path.join(repo, "AGENTS.md")), false);
});

test("global install uses each tool's user skill directory", async () => {
  const home = tempDir();
  const codexOut = capture();
  const claudeOut = capture();

  const codexCode = await runCli(["install", "--target", "codex", "--profile", "spec-driven", "--dry-run"], { stdout: codexOut.stream, home });
  const claudeCode = await runCli(["install", "--target", "claude", "--profile", "spec-driven", "--dry-run"], { stdout: claudeOut.stream, home });

  assert.equal(codexCode, 0);
  assert.equal(claudeCode, 0);
  assert.match(codexOut.output(), new RegExp(`${escapeRegex(path.join(home, ".agents", "skills"))}`));
  assert.match(claudeOut.output(), new RegExp(`${escapeRegex(path.join(home, ".claude", "skills"))}`));
});

test("doctor reports missing target files", () => {
  const repo = tempDir();
  const report = doctor({ target: "codex", profile: "spec-driven", repo });
  assert.ok(report.errors.some((error) => error.includes("Missing AGENTS.md")));
  assert.ok(report.errors.some((error) => error.includes("Missing specs/")));
});

test("doctor detects broken skill symlink", () => {
  const repo = tempDir();
  fs.mkdirSync(path.join(repo, ".agents", "skills"), { recursive: true });
  fs.symlinkSync(path.join(repo, "missing-skill"), path.join(repo, ".agents", "skills", "missing"), "dir");
  fs.writeFileSync(path.join(repo, "AGENTS.md"), "# Test\n");
  fs.mkdirSync(path.join(repo, "specs"));
  const report = doctor({ target: "codex", profile: "spec-driven", repo });
  assert.ok(report.errors.some((error) => error.includes("Broken symlink")));
});

test("doctor detects obvious secrets", () => {
  const repo = tempDir();
  fs.writeFileSync(path.join(repo, "AGENTS.md"), "# Test\n");
  fs.mkdirSync(path.join(repo, "specs"));
  fs.writeFileSync(path.join(repo, "leak.txt"), "token = sk-abcdefghijklmnopqrstuvwxyz123456");
  const report = doctor({ target: "codex", profile: "spec-driven", repo });
  assert.ok(report.errors.some((error) => error.includes("Possible secret")));
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
