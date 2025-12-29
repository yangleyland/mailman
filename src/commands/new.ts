import path from "path";
import { getFileNameFromUser } from "../utils/getFileNameFromUser";
import chalk from "chalk";
import { getConfigDir, loadConfig } from "../utils/config";
import { selectDirectory } from "../utils/selectDirectory";
import { promptNewRequest } from "../utils/promptNewRequest";
import fs from "fs";

export async function newCommand(): Promise<void> {
  // Get directory
  const config = loadConfig();

  if (!config) {
    console.log(chalk.red("No config.json found. Run 'mailman init' first."));
    process.exit(1);
  }

  const directory = await selectDirectory();

  if (!directory) {
    return;
  }

  const configDir = getConfigDir();
  const relativePath = path.relative(configDir, directory);
  console.log(chalk.cyan(`\nSelected directory: ${relativePath}/`));

  const { request } = await promptNewRequest(config, false);
  const fileName = await getFileNameFromUser();
  if (!fileName) {
    console.log(chalk.red("No filename provided"));
    process.exit(1);
  }
  const filepath = path.join(configDir, relativePath, fileName);
  fs.writeFileSync(filepath, JSON.stringify(request, null, 2));
}
