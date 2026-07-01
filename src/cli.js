import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKBENCH_ROOT = path.resolve(__dirname, "..");
const DEFAULT_PROFILE = "spec-driven";
const TARGETS = new Set(["codex", "claude", "gemini"]);
const GLOBAL_TARGETS = new Set(["codex", "claude", "agents", "gemini", "all"]);
const RENDER_TEMPLATES = {
  codex: { adapter: "codex", template: "AGENTS.md.tmpl", output: "AGENTS.md" },
  claude: { adapter: "claude", template: "CLAUDE.md.tmpl", output: "CLAUDE.md" },
  gemini: { adapter: "gemini", template: "GEMINI.md.tmpl", output: "GEMINI.md" }
};

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
      const mode = options.mode ?? "copy";
      const result = installTarget({ target, profile, mode, dest: options.dest, home, dryRun: options.dryRun });
      stdout.write(formatActions(result.actions, options.dryRun));
      return 0;
    }

    if (command === "sync-global") {
      const target = options.target ?? "all";
      const profile = options.profile ?? DEFAULT_PROFILE;
      const result = syncGlobal({ target, profile, home, dryRun: options.dryRun });
      stdout.write(formatActions(result.actions, options.dryRun));
      return 0;
    }

    if (command === "doctor-global") {
      const target = options.target ?? "all";
      const profile = options.profile ?? DEFAULT_PROFILE;
      const report = doctorGlobal({ target, profile, home });
      stdout.write(formatDoctor(report));
      return report.errors.length === 0 ? 0 : 1;
    }

    if (command === "sync-dotfiles") {
      const result = syncDotfiles({ home, dryRun: options.dryRun });
      stdout.write(formatActions(result.actions, options.dryRun));
      return 0;
    }

    if (command === "doctor-dotfiles") {
      const report = doctorDotfiles({ home });
      stdout.write(formatDoctor(report));
      return report.errors.length === 0 ? 0 : 1;
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
  ensureTarget(target);
  const templateInfo = RENDER_TEMPLATES[target];
  const templatePath = path.join(root, "adapters", templateInfo.adapter, templateInfo.template);
  const template = fs.readFileSync(templatePath, "utf8");
  const assets = selectAssets({ target, profile, root });
  const core = readExisting([
    "core/principles.md",
    "core/spec-driven-development.md",
    "core/security-baseline.md",
    "core/testing-baseline.md",
    "core/git-workflow.md",
    "core/review-baseline.md"
  ], root).join("\n\n");
  return template
    .replaceAll("{{PROFILE}}", profile)
    .replaceAll("{{TARGET}}", target)
    .replaceAll("{{REPO}}", repo)
    .replaceAll("{{CORE_GUIDANCE}}", core.trim())
    .replaceAll("{{ASSET_LIST}}", assets.map((asset) => `- ${asset.id}: ${asset.description}`).join("\n"));
}

export function installTarget({ target, profile = DEFAULT_PROFILE, mode = "copy", dest, home = process.env.HOME ?? process.cwd(), dryRun = false, root = WORKBENCH_ROOT }) {
  const actions = [];
  ensureTarget(target);
  const destination = path.resolve(dest ?? defaultUserGuidanceDir(target, home));
  const output = RENDER_TEMPLATES[target].output;
  const rendered = renderTarget({ target, profile, repo: destination, root });
  writeTextAction({ actions, file: path.join(destination, output), content: rendered, dryRun });

  if (target === "codex") {
    installSkills({ actions, target: "agents", profile, mode, dest: defaultUserSkillDir("agents", home, dest), dryRun, root });
  }

  if (target === "claude") {
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

  const output = RENDER_TEMPLATES[target].output;
  writeTextAction({ actions, file: path.join(projectRoot, output), content: rendered, dryRun });

  if (target === "codex") {
    installSkills({ actions, target, profile, mode, dest: path.join(projectRoot, ".agents", "skills"), dryRun, root });
    renderFileAction({ actions, template: "adapters/codex/config.toml.tmpl", file: path.join(projectRoot, ".codex", "config.toml"), target, profile, repo: projectRoot, dryRun, root });
    renderFileAction({ actions, template: "adapters/codex/hooks.json.tmpl", file: path.join(projectRoot, ".codex", "hooks.json"), target, profile, repo: projectRoot, dryRun, root });
  }

  if (target === "claude") {
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

  if (target === "gemini") {
    if (!fs.existsSync(path.join(projectRoot, "GEMINI.md"))) errors.push("Missing GEMINI.md for Gemini");
  }

  if ((profile === "spec-driven" || profile === "work") && !fs.existsSync(path.join(projectRoot, "specs"))) {
    errors.push("Missing specs/ folder for spec-driven profile");
  }

  return { errors, warnings };
}

export function syncGlobal({ target = "all", profile = DEFAULT_PROFILE, home = process.env.HOME ?? process.cwd(), dryRun = false, root = WORKBENCH_ROOT }) {
  const actions = [];
  for (const currentTarget of expandGlobalTargets(target)) {
    if (currentTarget === "agents") {
      installSkills({ actions, target: "agents", profile, mode: "copy", dest: path.join(home, ".agents", "skills"), dryRun, root });
      continue;
    }

    const destination = defaultUserGuidanceDir(currentTarget, home);
    const output = RENDER_TEMPLATES[currentTarget].output;
    const rendered = renderTarget({ target: currentTarget, profile, repo: destination, root });
    writeTextAction({ actions, file: path.join(destination, output), content: rendered, dryRun });

    if (currentTarget === "claude") {
      installSkills({ actions, target: currentTarget, profile, mode: "copy", dest: path.join(home, ".claude", "skills"), dryRun, root });
      installCommands({ actions, mode: "copy", dest: path.join(home, ".claude", "commands"), dryRun, root });
    }
  }
  return { actions };
}

export function doctorGlobal({ target = "all", profile = DEFAULT_PROFILE, home = process.env.HOME ?? process.cwd(), root = WORKBENCH_ROOT }) {
  const errors = [];
  const warnings = [];

  for (const currentTarget of expandGlobalTargets(target)) {
    if (currentTarget === "agents") {
      verifySkills({ errors, warnings, target: "agents", profile, dest: path.join(home, ".agents", "skills"), root });
      continue;
    }

    verifyRenderedGuidance({ errors, target: currentTarget, profile, home, root });

    if (currentTarget === "claude") {
      verifySkills({ errors, warnings, target: currentTarget, profile, dest: path.join(home, ".claude", "skills"), root });
      verifyCommands({ errors, warnings, dest: path.join(home, ".claude", "commands"), root });
    }
  }

  return { errors, warnings };
}

export function loadDotfileManifest(root = WORKBENCH_ROOT) {
  const manifestPath = path.join(root, "dotfiles", "manifest.yaml");
  const parsed = readYaml(manifestPath);
  if (!parsed || !Array.isArray(parsed.files)) {
    throw new Error("dotfiles/manifest.yaml must contain a files array");
  }
  for (const entry of parsed.files) {
    for (const field of ["source", "target", "type"]) {
      if (!entry[field]) throw new Error(`dotfiles manifest entry is missing required field '${field}'`);
    }
    if (!["file", "directory"].includes(entry.type)) {
      throw new Error(`Unsupported dotfiles manifest type '${entry.type}' for ${entry.source}`);
    }
  }
  return parsed;
}

export function syncDotfiles({ home = process.env.HOME ?? process.cwd(), dryRun = false, root = WORKBENCH_ROOT }) {
  const actions = [];
  const manifest = loadDotfileManifest(root);

  for (const entry of manifest.files) {
    const source = path.join(root, entry.source);
    const dest = path.join(home, entry.target);
    if (entry.type === "directory") {
      copyDirectoryAction({ actions, source, dest, mode: "copy", dryRun });
    } else {
      copyFileAction({ actions, source, dest, mode: "copy", dryRun });
    }
  }

  return { actions };
}

export function doctorDotfiles({ home = process.env.HOME ?? process.cwd(), root = WORKBENCH_ROOT }) {
  const errors = [];
  const warnings = [];
  const manifest = loadDotfileManifest(root);

  for (const entry of manifest.files) {
    const source = path.join(root, entry.source);
    const dest = path.join(home, entry.target);
    verifyManagedPath({ errors, warnings, source, dest, label: entry.target });
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
    throw new Error(`Unsupported target '${target}'. Supported targets: ${Array.from(TARGETS).join(", ")}`);
  }
}

function requireGlobalTarget(target) {
  if (!GLOBAL_TARGETS.has(target)) {
    throw new Error(`Unsupported global target '${target}'. Supported global targets: ${Array.from(GLOBAL_TARGETS).join(", ")}`);
  }
}

function expandGlobalTargets(target) {
  requireGlobalTarget(target);
  if (!target || target === "all") return ["codex", "agents", "claude", "gemini"];
  if (target === "codex") return ["codex", "agents"];
  return [target];
}

function verifyRenderedGuidance({ errors, target, profile, home, root }) {
  const destination = defaultUserGuidanceDir(target, home);
  const output = RENDER_TEMPLATES[target].output;
  const file = path.join(destination, output);
  const expected = renderTarget({ target, profile, repo: destination, root });

  if (!pathExists(file)) {
    errors.push(`Missing ${output} for ${target}: ${file}`);
    return;
  }
  if (fs.lstatSync(file).isSymbolicLink()) {
    errors.push(`Managed guidance is still a symlink: ${file}`);
    return;
  }
  if (fs.readFileSync(file, "utf8") !== expected) {
    errors.push(`Out of sync guidance: ${file}`);
  }
}

function verifySkills({ errors, warnings, target, profile, dest, root }) {
  const skills = selectAssets({ target, profile, root }).filter((asset) => asset.type === "skill");
  if (skills.length === 0) {
    warnings.push(`No managed skills selected for ${target}`);
    return;
  }
  for (const asset of skills) {
    const source = path.join(root, asset.path);
    const skillDest = path.join(dest, path.basename(asset.path));
    verifyManagedPath({ errors, warnings, source, dest: skillDest, label: `${target} skill ${asset.id}` });
  }
}

function verifyCommands({ errors, warnings, dest, root }) {
  let count = 0;
  const commandsDir = claudeCommandsDir(root);
  for (const entry of safeReaddir(commandsDir)) {
    if (!entry.endsWith(".md") || entry.toLowerCase() === "readme.md") continue;
    count += 1;
    verifyManagedPath({
      errors,
      warnings,
      source: path.join(commandsDir, entry),
      dest: path.join(dest, entry),
      label: `Claude command ${entry}`
    });
  }
  if (count === 0) warnings.push("No managed Claude commands found");
}

function verifyManagedPath({ errors, warnings, source, dest, label }) {
  if (!pathExists(source)) {
    errors.push(`Managed source is missing: ${source}`);
    return;
  }
  if (!pathExists(dest)) {
    errors.push(`Missing ${label}: ${dest}`);
    return;
  }
  if (fs.lstatSync(dest).isSymbolicLink()) {
    errors.push(`Managed path is still a symlink: ${dest}`);
    return;
  }
  if (!samePath(source, dest)) {
    errors.push(`Out of sync ${label}: ${dest}`);
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
  if (target === "codex") return path.join(home, ".codex");
  if (target === "claude") return path.join(home, ".claude");
  if (target === "gemini") return path.join(home, ".gemini");
  throw new Error(`No guidance directory for target '${target}'`);
}

function defaultUserSkillDir(target, home, dest) {
  if (dest) {
    if (target === "codex" || target === "agents") return path.join(path.resolve(dest), ".agents", "skills");
    return path.join(path.resolve(dest), "skills");
  }
  if (target === "codex" || target === "agents") return path.join(home, ".agents", "skills");
  return path.join(home, ".claude", "skills");
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
  const commandsDir = claudeCommandsDir(root);
  for (const entry of safeReaddir(commandsDir)) {
    if (!entry.endsWith(".md") || entry.toLowerCase() === "readme.md") continue;
    copyFileAction({ actions, source: path.join(commandsDir, entry), dest: path.join(dest, entry), mode, dryRun });
  }
}

function claudeCommandsDir(root) {
  return path.join(root, "adapters", "claude", "commands");
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
  if (pathExists(file) && fs.lstatSync(file).isSymbolicLink()) {
    fs.rmSync(file, { force: true });
  }
  fs.writeFileSync(file, content);
}

function copyDirectoryAction({ actions, source, dest, mode, dryRun }) {
  actions.push({ action: mode === "symlink" ? "symlink" : "copy", source, dest });
  if (dryRun) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (pathExists(dest)) fs.rmSync(dest, { recursive: true, force: true });
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
  if (pathExists(dest)) fs.rmSync(dest, { force: true });
  if (mode === "symlink") {
    fs.symlinkSync(source, dest);
  } else {
    fs.copyFileSync(source, dest);
  }
}

function pathExists(file) {
  try {
    fs.lstatSync(file);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

function samePath(left, right) {
  const leftStat = fs.lstatSync(left);
  const rightStat = fs.lstatSync(right);

  if (leftStat.isDirectory() !== rightStat.isDirectory()) return false;
  if (leftStat.isFile() !== rightStat.isFile()) return false;

  if (leftStat.isDirectory()) {
    const leftEntries = safeReaddir(left).filter((entry) => entry !== ".DS_Store").sort();
    const rightEntries = safeReaddir(right).filter((entry) => entry !== ".DS_Store").sort();
    if (leftEntries.length !== rightEntries.length) return false;
    for (let i = 0; i < leftEntries.length; i += 1) {
      if (leftEntries[i] !== rightEntries[i]) return false;
      if (!samePath(path.join(left, leftEntries[i]), path.join(right, rightEntries[i]))) return false;
    }
    return true;
  }

  return fs.readFileSync(left).equals(fs.readFileSync(right));
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
  return `workbench v0.1

Commands:
  sync-global [--target all|codex|agents|claude|gemini] [--profile spec-driven] [--dry-run]
  doctor-global [--target all|codex|agents|claude|gemini] [--profile spec-driven]
  sync-dotfiles [--dry-run]
  doctor-dotfiles
  install --target codex|claude|gemini [--profile spec-driven] [--mode copy|symlink] [--dest PATH] [--dry-run]
  attach-repo --repo PATH --target codex|claude|gemini [--profile spec-driven] [--mode copy|symlink] [--dry-run]
  render --target codex|claude|gemini [--profile spec-driven] [--repo PATH]
  doctor --repo PATH --target codex|claude|gemini [--profile spec-driven]
`;
}
