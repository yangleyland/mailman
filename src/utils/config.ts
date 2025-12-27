import fs from "fs";
import path from "path";
import { Config, Environment } from "../types";

const CONFIG_FILE = "config.json";

export function findConfigPath(startDir: string = process.cwd()): string | null {
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

  return null;
}

export function loadConfig(): Config | null {
  const configPath = findConfigPath();
  if (!configPath) {
    return null;
  }

  const content = fs.readFileSync(configPath, "utf-8");
  return JSON.parse(content);
}

export function getEnvironment(config: Config, envName?: string): Environment {
  const targetEnv = envName || config.defaultEnvironment;
  const env = config.environments[targetEnv];

  if (!env) {
    throw new Error(`Environment "${targetEnv}" not found in config`);
  }

  return env;
}

export function getConfigDir(): string {
  const configPath = findConfigPath();
  if (configPath) {
    return path.dirname(configPath);
  }
  return process.cwd();
}
