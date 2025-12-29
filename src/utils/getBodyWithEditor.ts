import { spawn } from "child_process";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import prompts from "prompts";

export async function getBodyWithEditor(): Promise<string | undefined> {
  const response = await prompts({
    type: "confirm",
    name: "useEditor",
    message: "Open editor for request body?",
    initial: false,
  });

  if (!response.useEditor) {
    return undefined;
  }

  const tmpFile = join(tmpdir(), `mailman-body-${Date.now()}.json`);

  writeFileSync(tmpFile, "{\n  \n}\n");

  return new Promise((resolve) => {
    const editor = process.env.EDITOR || "vim";
    const child = spawn(editor, [tmpFile], {
      stdio: "inherit",
    });

    child.on("exit", () => {
      try {
        const content = readFileSync(tmpFile, "utf-8").trim();
        unlinkSync(tmpFile); // clean up
        resolve(content || undefined);
      } catch {
        resolve(undefined);
      }
    });
  });
}
