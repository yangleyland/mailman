import fs from "fs";
import path from "path";
import os from "os";

const GLOBAL_CONFIG_DIR = path.join(os.homedir(), ".mailman");
const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_DIR, "global.json");

interface GlobalConfig {
  defaultProjectPath?: string;
}

function ensureGlobalConfigDir(): void {
  if (!fs.existsSync(GLOBAL_CONFIG_DIR)) {
    fs.mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  }
}

function isGlobalConfig(value: unknown): value is GlobalConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    obj.defaultProjectPath === undefined ||
    typeof obj.defaultProjectPath === "string"
  );
}

export function loadGlobalConfig(): GlobalConfig {
  if (!fs.existsSync(GLOBAL_CONFIG_FILE)) {
    return {};
  }
  const content = fs.readFileSync(GLOBAL_CONFIG_FILE, "utf-8");
  const parsed: unknown = JSON.parse(content);
  if (isGlobalConfig(parsed)) {
    return parsed;
  }
  return {};
}

export function saveGlobalConfig(config: GlobalConfig): void {
  ensureGlobalConfigDir();
  fs.writeFileSync(GLOBAL_CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getDefaultProjectPath(): string | undefined {
  const config = loadGlobalConfig();
  return config.defaultProjectPath;
}

export function setDefaultProjectPath(projectPath: string): void {
  const config = loadGlobalConfig();
  config.defaultProjectPath = projectPath;
  saveGlobalConfig(config);
}

export function clearDefaultProjectPath(): void {
  const config = loadGlobalConfig();
  delete config.defaultProjectPath;
  saveGlobalConfig(config);
}
