import chalk from "chalk";
import { listRequests } from "../utils/request";
import { loadConfig } from "../utils/config";

export function listCommand(): void {
  const config = loadConfig();

  if (!config) {
    console.log(chalk.red("No config.json found. Run 'mailman init' first."));
    process.exit(1);
  }

  const requests = listRequests();

  if (requests.length === 0) {
    console.log(chalk.yellow("No requests found in requests/ directory."));
    return;
  }

  console.log(chalk.cyan("Available requests:\n"));

  for (const req of requests) {
    console.log(`  ${chalk.green(req.name)}`);
    console.log(`  ${chalk.gray(req.filepath)}\n`);
  }
}
