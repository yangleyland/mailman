import { Variables } from "../types";
import prompts from "prompts";

export function findUnfilledVariables(template: string): string[] {
  const matches = template.matchAll(/\{\{(\w+)\}\}/g);
  return [...matches].map((match) => match[1]);
}
export function findUnfilledVariablesInObject<T>(obj: T): string[] {
  if (typeof obj === "string") {
    return findUnfilledVariables(obj);
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item) => findUnfilledVariablesInObject(item));
  }
  if (obj !== null && typeof obj === "object") {
    return Object.values(obj).flatMap((value) =>
      findUnfilledVariablesInObject(value),
    );
  }
  return [];
}
export async function fillUnfilledVariables(
  unfilledVariables: string[],
): Promise<Record<string, string>> {
  const unfilledVariablesFiltered = [...new Set(unfilledVariables)];
  const filledVarRecord: Record<string, string> = {};
  for (const unfilledVar of unfilledVariablesFiltered) {
    const response = await prompts({
      type: "text",
      name: "value",
      message: `Fill variable value for ${unfilledVar}`,
    });
    if (typeof response.value === "string") {
      filledVarRecord[unfilledVar] = response.value;
    }
  }
  return filledVarRecord;
}
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
