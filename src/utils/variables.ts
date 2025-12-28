import { Variables } from "../types";

export function interpolate(template: string, variables: Variables): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match: string, key: string): string => {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        return variables[key];
      }
      return match;
    },
  );
}

export function interpolateObject<T>(obj: T, variables: Variables): T {
  if (typeof obj === "string") {
    const interpolated: string = interpolate(obj, variables);
    return interpolated as unknown as T;
  }

  if (Array.isArray(obj)) {
    const mapped: unknown[] = obj.map((item: unknown) =>
      interpolateObject(item, variables),
    );
    return mapped as unknown as T;
  }

  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, variables);
    }
    return result as unknown as T;
  }

  return obj;
}
