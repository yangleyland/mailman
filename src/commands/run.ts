import axios, { AxiosError } from "axios";
import chalk from "chalk";
import prompts from "prompts";
import { loadRequest, resolveRequest, listRequests } from "../utils/request";
import { loadConfig, getEnvironment, getConfigDir } from "../utils/config";
import path from "path";

interface RunOptions {
  env?: string;
}

async function selectRequest(): Promise<string | null> {
  const requests = listRequests();

  if (requests.length === 0) {
    console.log(chalk.yellow("No requests found in requests/ directory."));
    return null;
  }

  const choices = requests.map((req) => ({
    title: req.name,
    description: req.filepath,
    value: req.filepath,
  }));

  const response = await prompts<"filepath">({
    type: "select",
    name: "filepath",
    message: "Select a request to run",
    choices,
  });

  if (typeof response.filepath === "string") {
    return response.filepath;
  }
  return null;
}

export async function runCommand(
  filepath?: string,
  options?: RunOptions
): Promise<void> {
  const config = loadConfig();

  if (!config) {
    console.log(chalk.red("No config.json found. Run 'mailman init' first."));
    process.exit(1);
  }

  let targetPath = filepath;

  if (!targetPath) {
    const selected = await selectRequest();
    if (!selected) {
      return;
    }
    targetPath = path.join(getConfigDir(), selected);
  }

  try {
    const request = loadRequest(targetPath);
    const environment = getEnvironment(config, options?.env);
    const resolved = resolveRequest(request, environment);

    const envName = options?.env || config.defaultEnvironment;
    console.log(chalk.cyan(`\nRunning: ${resolved.name}`));
    console.log(chalk.gray(`Environment: ${envName}`));
    console.log(chalk.gray(`${resolved.method} ${resolved.url}\n`));

    const startTime = Date.now();

    const response = await axios({
      method: resolved.method,
      url: resolved.url,
      headers: resolved.headers,
      data: resolved.body,
      validateStatus: () => true,
    });

    const duration = Date.now() - startTime;

    const statusColor =
      response.status >= 200 && response.status < 300
        ? chalk.green
        : response.status >= 400
        ? chalk.red
        : chalk.yellow;

    console.log(statusColor(`Status: ${response.status} ${response.statusText}`));
    console.log(chalk.gray(`Time: ${duration}ms\n`));

    console.log(chalk.green("Response Headers:"));
    for (const [key, value] of Object.entries(response.headers)) {
      console.log(`  ${key}: ${value}`);
    }

    if (response.data) {
      console.log(chalk.green("\nResponse Body:"));
      if (typeof response.data === "object") {
        console.log(JSON.stringify(response.data, null, 2));
      } else {
        console.log(response.data);
      }
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.code === "ECONNREFUSED") {
        console.log(chalk.red(`Connection refused. Is the server running?`));
      } else {
        console.log(chalk.red(`Request failed: ${error.message}`));
      }
    } else if (error instanceof Error) {
      console.log(chalk.red(error.message));
    }
    process.exit(1);
  }
}
