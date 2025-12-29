import fs from "fs";
import path from "path";
import chalk from "chalk";
import prompts from "prompts";
import { getConfigDir } from "../utils/config";

function getDirectories(baseDir: string): string[] {
  const directories: string[] = [];

  function scanDir(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        directories.push(fullPath);
        scanDir(fullPath);
      }
    }
  }

  scanDir(baseDir);
  return directories;
}

export async function selectDirectory(): Promise<string | null> {
  const configDir = getConfigDir();
  const requestsDir = path.join(configDir, "requests");

  if (!fs.existsSync(requestsDir)) {
    console.log(
      chalk.red("No requests/ directory found. Run 'mailman init' first."),
    );
    return null;
  }

  const subdirectories = getDirectories(requestsDir);

  const choices = [
    {
      title: "requests/",
      description: "Root requests directory",
      value: requestsDir,
    },
  ];

  for (const dir of subdirectories) {
    const relativePath = path.relative(configDir, dir);
    choices.push({
      title: relativePath + "/",
      description: dir,
      value: dir,
    });
  }

  choices.push({
    title: "Create new directory",
    description: "Create a new subdirectory in requests/",
    value: "__new__",
  });

  const response = await prompts({
    type: "select",
    name: "directory",
    message: "Select directory for the new request",
    choices,
  });

  if (!response.directory) {
    return null;
  }

  if (response.directory === "__new__") {
    const nameResponse = await prompts({
      type: "text",
      name: "name",
      message: "Enter new directory name",
      validate: (value: string) =>
        value.trim().length > 0 || "Directory name cannot be empty",
    });

    if (typeof nameResponse.name !== "string" || !nameResponse.name) {
      return null;
    }

    const dirName = nameResponse.name.trim();
    const newDir = path.join(requestsDir, dirName);

    if (fs.existsSync(newDir)) {
      console.log(chalk.yellow(`Directory already exists: ${newDir}`));
      return newDir;
    }

    fs.mkdirSync(newDir, { recursive: true });
    console.log(chalk.green(`Created directory: ${dirName}/`));
    return newDir;
  }

  if (typeof response.directory !== "string") {
    return null;
  }

  return response.directory;
}
