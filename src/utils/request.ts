import fs from "fs";
import path from "path";
import { RequestFile, ResolvedRequest, Variables, HttpMethod } from "../types";
import { interpolateObject } from "./variables";
import { getConfigDir } from "./config";

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function isHttpMethod(value: unknown): value is HttpMethod {
  return (
    typeof value === "string" && HTTP_METHODS.includes(value as HttpMethod)
  );
}

function isRequestFile(value: unknown): value is RequestFile {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    isHttpMethod(obj.method) &&
    typeof obj.url === "string"
  );
}

export function loadRequest(filepath: string): RequestFile {
  const absolutePath = path.isAbsolute(filepath)
    ? filepath
    : path.join(getConfigDir(), filepath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Request file not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, "utf-8");
  const parsed: unknown = JSON.parse(content);
  if (isRequestFile(parsed)) {
    return parsed;
  }
  throw new Error(`Invalid request file format: ${absolutePath}`);
}

export function resolveRequest(
  request: RequestFile,
  variables: Variables,
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

  function scanDir(dir: string): void {
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
