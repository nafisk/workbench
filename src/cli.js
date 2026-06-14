import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKBENCH_ROOT = path.resolve(__dirname, "..");
const DEFAULT_PROFILE = "spec-driven";
const TARGETS = new Set(["codex", "claude"]);

export async function runCli(argv, io = {}) {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  const home = io.home ?? process.env.HOME ?? process.cwd();
  const cwd = io.cwd ?? process.cwd();
  const [command, ...rest] = argv;

  try {
    if (!command || command === "help" || command === "--help" || command === "-h") {
      stdout.write(helpText());
      return 0;
    }

    const options = parseOptions(rest);

    if (command === "render") {
      const target = requireTarget(options.target);
      const profile = options.profile ?? DEFAULT_PROFILE;
      const rendered = renderTarget({ target, profile, repo: options.repo ?? cwd });
      stdout.write(rendered + "\n");
      return 0;
    }

    if (command === "install") {
      const target = requireTarget(options.target);
      const profile = options.profile ?? DEFAULT_PROFILE;
      const mode = options.mode ?? "symlink";
      const result = installTarget({ target, profile, mode, dest: options.dest, home, dryRun: options.dryRun });
      stdout.write(formatActions(result.actions, options.dryRun));
      return 0;
    }

    if (command === "attach-repo") {
      const target = requireTarget(options.target);
      const profile = options.profile ?? DEFAULT_PROFILE;
      const mode = options.mode ?? "copy";
      const repo = options.repo ? path.resolve(cwd, options.repo) : cwd;
      const result = attachRepo({ target, profile, mode, repo, dryRun: options.dryRun });
      stdout.write(formatActions(result.actions, options.dryRun));
      return 0;
    }

    if (command === "doctor") {
      const target = requireTarget(options.target);
      const profile = options.profile ?? DEFAULT_PROFILE;
      const repo = options.repo ? path.resolve(cwd, options.repo) : cwd;
      const report = doctor({ target, profile, repo });
      stdout.write(formatDoctor(report));
      return report.errors.length === 0 ? 0 : 1;
    }

    stderr.write(`Unknown command: ${command}\n\n${helpText()}`);
    return 1;
  } catch (error) {
    stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

export function loadRegistry(root = WORKBENCH_ROOT) {
  const parsed = readYaml(path.join(root, "registry.yaml"));
  if (!parsed || !Array.isArray(parsed.assets)) {
    throw new Error("registry.yaml must contain an assets array");
  }
  for (const asset of parsed.assets) {
    for (const field of ["id", "type", "status", "targets", "install", "path", "description"]) {
      if (asset[field] === undefined || asset[field] === null || asset[field] === "") {
        throw new Error(`registry asset is missing required field '${field}'`);
      }
    }
  }
  return parsed;
}

export function loadProfile(profile, root = WORKBENCH_ROOT) {
  const parsed = readYaml(path.join(root, "profiles", `${profile}.yaml`));
  if (!parsed || !Array.isArray(parsed.assets)) {
    throw new Error(`profiles/${profile}.yaml must contain an assets array`);
  }
  return parsed;
}

export function selectAssets({ target, profile, root = WORKBENCH_ROOT }) {
  const registry = loadRegistry(root);
  const profileData = loadProfile(profile, root);
  const selected = new Set(profileData.assets);
  return registry.assets.filter((asset) => {
    return selected.has(asset.id) && asset.targets.includes(target);
  });
}

export function renderTarget({ target, profile = DEFAULT_PROFILE, repo = process.cwd(), root = WORKBENCH_ROOT }) {
  const templateName = target === "codex" ? "AGENTS.md.tmpl" : "CLAUDE.md.tmpl";
  const templatePath = path.join(root, "adapters", target, templateName);
  const template = fs.readFileSync(templatePath, "utf8");
  const assets = selectAssets({ target, profile, root });
  const core = readExisting([
    "core/principles.md",
    "core/spec-driven-development.md",
    "core/security-baseline.md",
    "core/testing-baseline.md",
    "core/git-workflow.md"
  ], root).join("\n\n");
  return template
    .replaceAll("{{PROFILE}}", profile)
    .replaceAll("{{TARGET}}", target)
    .replaceAll("{{REPO}}", repo)
    .replaceAll("{{CORE_GUIDANCE}}", core.trim())
    .replaceAll("{{ASSET_LIST}}", assets.map((asset) => `- ${asset.id}: ${asset.description}`).join("\n"));
}

export function installTarget({ target, profile = DEFAULT_PROFILE, mode = "symlink", dest, home = process.env.HOME ?? process.cwd(), dryRun = false, root = WORKBENCH_ROOT }) {
  const actions = [];
  ensureTarget(target);
  const destination = path.resolve(dest ?? defaultUserGuidanceDir(target, home));
  if (target === "codex") {
    const rendered = renderTarget({ target, profile, repo: destination, root });
    writeTextAction({ actions, file: path.join(destination, "AGENTS.md"), content: rendered, dryRun });
    installSkills({ actions, target, profile, mode, dest: defaultUserSkillDir(target, home, dest), dryRun, root });
  } else {
    const rendered = renderTarget({ target, profile, repo: destination, root });
    writeTextAction({ actions, file: path.join(destination, "CLAUDE.md"), content: rendered, dryRun });
    installSkills({ actions, target, profile, mode, dest: defaultUserSkillDir(target, home, dest), dryRun, root });
    installCommands({ actions, mode, dest: path.join(destination, "commands"), dryRun, root });
  }
  return { actions };
}

export function attachRepo({ target, profile = DEFAULT_PROFILE, mode = "copy", repo, dryRun = false, root = WORKBENCH_ROOT }) {
  const actions = [];
  ensureTarget(target);
  const projectRoot = path.resolve(repo);
  const rendered = renderTarget({ target, profile, repo: projectRoot, root });

  if (target === "codex") {
    writeTextAction({ actions, file: path.join(projectRoot, "AGENTS.md"), content: rendered, dryRun });
    installSkills({ actions, target, profile, mode, dest: path.join(projectRoot, ".agents", "skills"), dryRun, root });
    renderFileAction({ actions, template: "adapters/codex/config.toml.tmpl", file: path.join(projectRoot, ".codex", "config.toml"), target, profile, repo: projectRoot, dryRun, root });
    renderFileAction({ actions, template: "adapters/codex/hooks.json.tmpl", file: path.join(projectRoot, ".codex", "hooks.json"), target, profile, repo: projectRoot, dryRun, root });
  } else {
    writeTextAction({ actions, file: path.join(projectRoot, "CLAUDE.md"), content: rendered, dryRun });
    installSkills({ actions, target, profile, mode, dest: path.join(projectRoot, ".claude", "skills"), dryRun, root });
    installCommands({ actions, mode, dest: path.join(projectRoot, ".claude", "commands"), dryRun, root });
    renderFileAction({ actions, template: "adapters/claude/settings.json.tmpl", file: path.join(projectRoot, ".claude", "settings.json"), target, profile, repo: projectRoot, dryRun, root });
  }

  if (profile === "spec-driven" || profile === "work") {
    copyDirectoryAction({ actions, source: path.join(root, "specs", "templates"), dest: path.join(projectRoot, "specs", "templates"), mode: "copy", dryRun });
  }

  return { actions };
}

export function doctor({ target, profile = DEFAULT_PROFILE, repo, root = WORKBENCH_ROOT }) {
  ensureTarget(target);
  const errors = [];
  const warnings = [];
  const projectRoot = path.resolve(repo);

  if (!fs.existsSync(projectRoot)) {
    errors.push(`Repository path does not exist: ${projectRoot}`);
    return { errors, warnings };
  }

  for (const broken of findBrokenSymlinks(projectRoot)) {
    errors.push(`Broken symlink: ${broken}`);
  }

  for (const finding of scanSecrets(projectRoot)) {
    errors.push(`Possible secret in ${finding.file}: ${finding.reason}`);
  }

  const profileData = loadProfile(profile, root);
  for (const assetId of profileData.assets) {
    const asset = loadRegistry(root).assets.find((candidate) => candidate.id === assetId);
    if (!asset) errors.push(`Profile references missing asset: ${assetId}`);
  }

  if (target === "codex") {
    if (!fs.existsSync(path.join(projectRoot, "AGENTS.md"))) errors.push("Missing AGENTS.md for Codex");
    if (!fs.existsSync(path.join(projectRoot, ".agents", "skills"))) warnings.push("Missing .agents/skills for Codex skills");
  }

  if (target === "claude") {
    if (!fs.existsSync(path.join(projectRoot, "CLAUDE.md"))) errors.push("Missing CLAUDE.md for Claude Code");
    if (!fs.existsSync(path.join(projectRoot, ".claude", "skills"))) warnings.push("Missing .claude/skills for Claude Code skills");
    if (!fs.existsSync(path.join(projectRoot, ".claude", "commands"))) warnings.push("Missing .claude/commands for Claude Code commands");
  }

  if ((profile === "spec-driven" || profile === "work") && !fs.existsSync(path.join(projectRoot, "specs"))) {
    errors.push("Missing specs/ folder for spec-driven profile");
  }

  return { errors, warnings };
}

function parseOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2).replaceAll("-", "_");
    const value = args[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for ${arg}`);
    }
    options[toCamel(key)] = value;
    i += 1;
  }
  return options;
}

function toCamel(value) {
  return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function requireTarget(target) {
  if (!target) throw new Error("Missing --target");
  ensureTarget(target);
  return target;
}

function ensureTarget(target) {
  if (!TARGETS.has(target)) {
    throw new Error(`Unsupported target '${target}'. v0.1 supports: ${Array.from(TARGETS).join(", ")}`);
  }
}

function readYaml(file) {
  return YAML.parse(fs.readFileSync(file, "utf8"));
}

function readExisting(files, root) {
  return files
    .map((file) => path.join(root, file))
    .filter((file) => fs.existsSync(file))
    .map((file) => fs.readFileSync(file, "utf8"));
}

function defaultUserGuidanceDir(target, home) {
  return target === "codex" ? path.join(home, ".codex") : path.join(home, ".claude");
}

function defaultUserSkillDir(target, home, dest) {
  if (dest) {
    return target === "codex"
      ? path.join(path.resolve(dest), ".agents", "skills")
      : path.join(path.resolve(dest), "skills");
  }
  return target === "codex"
    ? path.join(home, ".agents", "skills")
    : path.join(home, ".claude", "skills");
}

function installSkills({ actions, target, profile, mode, dest, dryRun, root }) {
  const assets = selectAssets({ target, profile, root }).filter((asset) => asset.type === "skill");
  for (const asset of assets) {
    const source = path.join(root, asset.path);
    const targetDir = path.join(dest, path.basename(asset.path));
    copyDirectoryAction({ actions, source, dest: targetDir, mode, dryRun });
  }
}

function installCommands({ actions, mode, dest, dryRun, root }) {
  const commandsDir = path.join(root, "commands");
  for (const entry of safeReaddir(commandsDir)) {
    if (!entry.endsWith(".md") || entry.toLowerCase() === "readme.md") continue;
    copyFileAction({ actions, source: path.join(commandsDir, entry), dest: path.join(dest, entry), mode, dryRun });
  }
}

function renderFileAction({ actions, template, file, target, profile, repo, dryRun, root }) {
  const templatePath = path.join(root, template);
  const content = fs.readFileSync(templatePath, "utf8")
    .replaceAll("{{PROFILE}}", profile)
    .replaceAll("{{TARGET}}", target)
    .replaceAll("{{REPO}}", repo);
  writeTextAction({ actions, file, content, dryRun });
}

function writeTextAction({ actions, file, content, dryRun }) {
  actions.push({ action: "render", file });
  if (dryRun) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function copyDirectoryAction({ actions, source, dest, mode, dryRun }) {
  actions.push({ action: mode === "symlink" ? "symlink" : "copy", source, dest });
  if (dryRun) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
  if (mode === "symlink") {
    fs.symlinkSync(source, dest, "dir");
  } else {
    fs.cpSync(source, dest, { recursive: true });
  }
}

function copyFileAction({ actions, source, dest, mode, dryRun }) {
  actions.push({ action: mode === "symlink" ? "symlink" : "copy", source, dest });
  if (dryRun) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(dest)) fs.rmSync(dest, { force: true });
  if (mode === "symlink") {
    fs.symlinkSync(source, dest);
  } else {
    fs.copyFileSync(source, dest);
  }
}

function findBrokenSymlinks(dir) {
  const broken = [];
  for (const file of walk(dir)) {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) {
      const target = fs.readlinkSync(file);
      const resolved = path.resolve(path.dirname(file), target);
      if (!fs.existsSync(resolved)) broken.push(file);
    }
  }
  return broken;
}

function scanSecrets(dir) {
  const findings = [];
  const secretPatterns = [
    { reason: "OpenAI-style token", regex: /sk-[A-Za-z0-9_-]{20,}/ },
    { reason: "GitHub token", regex: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
    { reason: "hard-coded credential assignment", regex: /(api[_-]?key|token|secret|password)\s*[:=]\s*["']?(?!\$\{?[A-Z0-9_]+\}?|YOUR_|REPLACE_|<|""|'')\S{8,}/i }
  ];
  for (const file of walk(dir)) {
    if (shouldSkipScan(file)) continue;
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile()) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const pattern of secretPatterns) {
      if (pattern.regex.test(text)) {
        findings.push({ file, reason: pattern.reason });
        break;
      }
    }
  }
  return findings;
}

function shouldSkipScan(file) {
  return file.includes(`${path.sep}.git${path.sep}`)
    || file.includes(`${path.sep}node_modules${path.sep}`)
    || file.endsWith("package-lock.json");
}

function walk(dir) {
  const results = [];
  for (const entry of safeReaddir(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.lstatSync(full);
    results.push(full);
    if (stat.isDirectory() && !stat.isSymbolicLink()) {
      results.push(...walk(full));
    }
  }
  return results;
}

function safeReaddir(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

function formatActions(actions, dryRun) {
  const prefix = dryRun ? "DRY RUN" : "APPLIED";
  return actions.map((action) => {
    if (action.action === "render") return `${prefix}: render ${action.file}`;
    return `${prefix}: ${action.action} ${action.source} -> ${action.dest}`;
  }).join("\n") + "\n";
}

function formatDoctor(report) {
  const lines = [];
  for (const warning of report.warnings) lines.push(`WARN: ${warning}`);
  for (const error of report.errors) lines.push(`ERROR: ${error}`);
  if (lines.length === 0) lines.push("OK: doctor checks passed");
  return lines.join("\n") + "\n";
}

function helpText() {
  return `agent-workbench v0.1

Commands:
  install --target codex|claude [--profile spec-driven] [--mode symlink|copy] [--dest PATH] [--dry-run]
  attach-repo --repo PATH --target codex|claude [--profile spec-driven] [--mode symlink|copy] [--dry-run]
  render --target codex|claude [--profile spec-driven] [--repo PATH]
  doctor --repo PATH --target codex|claude [--profile spec-driven]
`;
}
