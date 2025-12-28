#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { initCommand } from "./commands/init";
import { listCommand } from "./commands/list";
import { viewCommand } from "./commands/view";
import { runCommand } from "./commands/run";

const program = new Command();

program
  .name("mailman")
  .description("A CLI clone of Postman for managing HTTP requests")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new mailman project with sample files")
  .action(initCommand);

program
  .command("list")
  .description("List all available requests")
  .action(listCommand);

program
  .command("view <filepath>")
  .description("View the resolved request that will be made")
  .option("-e, --env <environment>", "Environment to use")
  .action(viewCommand);

program
  .command("run [filepath]")
  .description("Run a request (prompts for selection if no filepath given)")
  .option("-e, --env <environment>", "Environment to use")
  .option(
    "-v, --var <key=value...>",
    "Set variables (can be used multiple times)",
  )
  .action(runCommand);

program.parse();
