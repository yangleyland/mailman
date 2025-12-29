import axios, { AxiosError } from "axios";
import chalk from "chalk";
import prompts from "prompts";
import { loadRequest, resolveRequest, listRequests } from "../utils/request";
import { promptNewRequest } from "../utils/promptNewRequest";
import { RequestFile } from "../types";
import {
  loadConfig,
  getEnvironmentVariables,
  getConfigDir,
} from "../utils/config";
import path from "path";
import dotenv from "dotenv";
import {
  findUnfilledVariablesInObject,
  fillUnfilledVariables,
} from "../utils/variables";

interface RunOptions {
  env?: string;
  var?: string[];
}

async function selectRequest(): Promise<string | null> {
  const requests = listRequests();

  if (requests.length === 0) {
    console.log(chalk.yellow("No requests found in requests/ directory."));
    return null;
  }

  const requestFiles = requests.map((req) => ({
    title: req.name,
    description: req.filepath,
    value: req.filepath,
  }));
  const choices = [
    {
      title: "Run new request",
      description: "Run new request",
      value: "Run new request",
    },
  ].concat(requestFiles);

  const response = await prompts({
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
  options?: RunOptions,
): Promise<void> {
  const config = loadConfig();

  if (!config) {
    console.log(chalk.red("No config.json found. Run 'mailman init' first."));
    process.exit(1);
  }

  let targetPath = filepath;

  let runNewRequest = false;
  if (!targetPath) {
    const selected = await selectRequest();
    if (!selected) {
      return;
    }
    if (selected === "Run new request") {
      runNewRequest = true;
    }
    targetPath = path.join(getConfigDir(), selected);
  }

  try {
    // If target path = "Run new request", fetch new request object

    let request: RequestFile;
    if (runNewRequest) {
      const newReqRes = await promptNewRequest(config);
      request = newReqRes.request;
    } else {
      request = loadRequest(targetPath);
    }
    const variables = getEnvironmentVariables(config, options?.env);
    let path = ".env";
    if (options?.env && config.defaultEnvironment !== options?.env) {
      path += ".";
      path += options?.env;
    }
    const envs = dotenv.config({ path }).parsed;

    if (request?.defaultValues) {
      for (const [key, value] of Object.entries(request?.defaultValues)) {
        variables[key] = value;
      }
    }
    if (envs) {
      for (const [key, value] of Object.entries(envs)) {
        variables[key] = value;
      }
    }
    for (const v of options?.var ?? []) {
      const [key, ...rest] = v.split("=");
      variables[key] = rest.join("=");
    }
    let resolved = resolveRequest(request, variables);
    const unfilledVariables = findUnfilledVariablesInObject(resolved);
    if (unfilledVariables.length > 0) {
      const filledVariables = await fillUnfilledVariables(unfilledVariables);
      for (const [key, value] of Object.entries(filledVariables)) {
        variables[key] = value;
      }
      resolved = resolveRequest(request, variables);
    }

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

    console.log(
      statusColor(`Status: ${response.status} ${response.statusText}`),
    );
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
