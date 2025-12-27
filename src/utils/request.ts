import fs from "fs";
import path from "path";
import { RequestFile, ResolvedRequest, Environment } from "../types";
import { interpolateObject } from "./variables";
import { getConfigDir } from "./config";

export function loadRequest(filepath: string): RequestFile {
  const absolutePath = path.isAbsolute(filepath)
    ? filepath
    : path.join(process.cwd(), filepath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Request file not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  return JSON.parse(content);
}

export function resolveRequest(
  request: RequestFile,
  variables: Environment
): ResolvedRequest {
  const interpolated = interpolateObject(request, variables);

  return {
    name: interpolated.name,
    method: interpolated.method,
    url: interpolated.url,
    headers: interpolated.headers || {},
    body: interpolated.body,
  };
}

export function listRequests(): Array<{ name: string; filepath: string }> {
  const configDir = getConfigDir();
  const requestsDir = path.join(configDir, "requests");

  if (!fs.existsSync(requestsDir)) {
    return [];
  }

  const results: Array<{ name: string; filepath: string }> = [];

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        try {
          const request = loadRequest(fullPath);
          const relativePath = path.relative(configDir, fullPath);
          results.push({
            name: request.name,
            filepath: relativePath,
          });
        } catch {
          continue;
        }
      }
    }
  }

  scanDir(requestsDir);
  return results;
}
