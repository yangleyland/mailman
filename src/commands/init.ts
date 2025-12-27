import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Config, RequestFile } from "../types";

const SAMPLE_CONFIG: Config = {
  defaultEnvironment: "dev",
  environments: {
    dev: {
      baseUrl: "http://localhost:3000",
      apiKey: "dev-api-key",
    },
    prod: {
      baseUrl: "https://api.example.com",
      apiKey: "prod-api-key",
    },
  },
};

const SAMPLE_REQUESTS: Array<{ filename: string; content: RequestFile }> = [
  {
    filename: "get-users.json",
    content: {
      name: "Get Users",
      method: "GET",
      url: "{{baseUrl}}/users",
      headers: {
        Authorization: "Bearer {{apiKey}}",
      },
    },
  },
  {
    filename: "create-user.json",
    content: {
      name: "Create User",
      method: "POST",
      url: "{{baseUrl}}/users",
      headers: {
        Authorization: "Bearer {{apiKey}}",
        "Content-Type": "application/json",
      },
      body: {
        name: "John Doe",
        email: "john@example.com",
      },
    },
  },
];

export function initCommand(): void {
  const cwd = process.cwd();
  const configPath = path.join(cwd, "config.json");
  const requestsDir = path.join(cwd, "requests");

  if (fs.existsSync(configPath)) {
    console.log(chalk.yellow("config.json already exists, skipping..."));
  } else {
    fs.writeFileSync(configPath, JSON.stringify(SAMPLE_CONFIG, null, 2));
    console.log(chalk.green("Created config.json"));
  }

  if (!fs.existsSync(requestsDir)) {
    fs.mkdirSync(requestsDir, { recursive: true });
    console.log(chalk.green("Created requests/ directory"));
  }

  for (const sample of SAMPLE_REQUESTS) {
    const filepath = path.join(requestsDir, sample.filename);
    if (fs.existsSync(filepath)) {
      console.log(
        chalk.yellow(`${sample.filename} already exists, skipping...`),
      );
    } else {
      fs.writeFileSync(filepath, JSON.stringify(sample.content, null, 2));
      console.log(chalk.green(`Created requests/${sample.filename}`));
    }
  }

  console.log(chalk.cyan("\nMailman initialized successfully!"));
  console.log(chalk.gray("Run 'mailman list' to see available requests"));
}
