import chalk from "chalk";
import { loadRequest, resolveRequest } from "../utils/request";
import { loadConfig, getEnvironment } from "../utils/config";

interface ViewOptions {
  env?: string;
}

export function viewCommand(
  filepath: string,
  options: ViewOptions
): void {
  const config = loadConfig();

  if (!config) {
    console.log(chalk.red("No config.json found. Run 'mailman init' first."));
    process.exit(1);
  }

  try {
    const request = loadRequest(filepath);
    const environment = getEnvironment(config, options.env);
    const resolved = resolveRequest(request, environment);

    const envName = options.env || config.defaultEnvironment;
    console.log(chalk.cyan(`\nRequest: ${resolved.name}`));
    console.log(chalk.gray(`Environment: ${envName}\n`));

    console.log(chalk.green("Method:"), resolved.method);
    console.log(chalk.green("URL:"), resolved.url);

    if (Object.keys(resolved.headers).length > 0) {
      console.log(chalk.green("\nHeaders:"));
      for (const [key, value] of Object.entries(resolved.headers)) {
        console.log(`  ${key}: ${value}`);
      }
    }

    if (resolved.body) {
      console.log(chalk.green("\nBody:"));
      console.log(JSON.stringify(resolved.body, null, 2));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(error.message));
    }
    process.exit(1);
  }
}
