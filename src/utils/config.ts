import fs from "fs";
import path from "path";
import { Config, Environment } from "../types";
import { getDefaultProjectPath } from "./globalConfig";

const CONFIG_FILE = "config.json";

export function findConfigPath(
  startDir: string = process.cwd(),
): string | null {
  let currentDir = startDir;

  while (currentDir !== path.dirname(currentDir)) {
    const configPath = path.join(currentDir, CONFIG_FILE);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    currentDir = path.dirname(currentDir);
  }

  const rootConfig = path.join(currentDir, CONFIG_FILE);
  if (fs.existsSync(rootConfig)) {
    return rootConfig;
  }

  const defaultPath = getDefaultProjectPath();
  if (defaultPath) {
    const defaultConfigPath = path.join(defaultPath, CONFIG_FILE);
    if (fs.existsSync(defaultConfigPath)) {
      return defaultConfigPath;
    }
  }

  return null;
}

function isConfig(value: unknown): value is Config {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.defaultEnvironment === "string" &&
    typeof obj.environments === "object" &&
    obj.environments !== null
  );
}

export function loadConfig(): Config | null {
  const configPath = findConfigPath();
  if (!configPath) {
    return null;
  }

  const content = fs.readFileSync(configPath, "utf-8");
  const parsed: unknown = JSON.parse(content);
  if (isConfig(parsed)) {
    return parsed;
  }
  return null;
}

export function getEnvironmentObject(
  config: Config,
  envName?: string,
): Environment {
  const targetEnvName = envName || config.defaultEnvironment;
  const envVariables = config.environments[targetEnvName];

  if (!envVariables) {
    throw new Error(`Environment "${targetEnvName}" not found in config`);
  }

  return envVariables;
}

export function getConfigDir(): string {
  const configPath = findConfigPath();
  if (configPath) {
    return path.dirname(configPath);
  }
  return process.cwd();
}
