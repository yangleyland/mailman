import { Environment } from "../types";

export function interpolate(template: string, variables: Environment): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

export function interpolateObject<T>(obj: T, variables: Environment): T {
  if (typeof obj === "string") {
    return interpolate(obj, variables) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, variables)) as T;
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, variables);
    }
    return result as T;
  }

  return obj;
}
