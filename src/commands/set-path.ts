import chalk from "chalk";
import path from "path";
import fs from "fs";
import {
  setDefaultProjectPath,
  clearDefaultProjectPath,
  getDefaultProjectPath,
} from "../utils/globalConfig";

interface SetPathOptions {
  clear?: boolean;
}

export function setPathCommand(
  projectPath: string | undefined,
  options: SetPathOptions,
): void {
  if (options.clear) {
    clearDefaultProjectPath();
    console.log(chalk.green("Default project path cleared."));
    return;
  }

  const targetPath = projectPath ? path.resolve(projectPath) : process.cwd();

  const configPath = path.join(targetPath, "config.json");
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red(`No config.json found at ${targetPath}`));
    console.log(chalk.yellow("Run 'mailman init' in that directory first."));
    return;
  }

  setDefaultProjectPath(targetPath);
  console.log(chalk.green(`Default project path set to: ${targetPath}`));
}

export function showPathCommand(): void {
  const currentPath = getDefaultProjectPath();
  if (currentPath) {
    console.log(chalk.cyan(`Default project path: ${currentPath}`));
  } else {
    console.log(chalk.yellow("No default project path set."));
  }
}
