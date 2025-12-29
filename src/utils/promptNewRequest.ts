import { RequestFile, HttpMethod, Config } from "../types";
import { validMethods } from "./constants";
import prompts from "prompts";

async function getEnvironment(config: Config): Promise<string | null> {
  // loop through config.environments
  const choices = [];
  for (const [key] of Object.entries(config.environments)) {
    const environment = key;
    const choiceObject = { title: environment, value: environment };
    choices.push(choiceObject);
  }
  const response = await prompts({
    type: "select",
    name: "environment",
    message: "Select Environment",
    choices,
  });
  if (typeof response.environment === "string") {
    return response.environment;
  }
  return null;
}
function convertStringToMethodType(methodStr: string): methodStr is HttpMethod {
  return validMethods.includes(methodStr);
}
async function getMethod(): Promise<HttpMethod | null> {
  const choices = [];
  for (const validMethod of validMethods) {
    const object = { title: validMethod, value: validMethod };
    choices.push(object);
  }
  const response = await prompts({
    type: "select",
    name: "method",
    message: "Select Method",
    choices,
  });

  if (
    typeof response.method === "string" &&
    convertStringToMethodType(response.method)
  ) {
    return response.method;
  }
  return null;
}
async function getRequestUrl(): Promise<string | null> {
  const response = await prompts({
    type: "text",
    name: "value",
    message: "Enter request url",
  });
  if (typeof response.value === "string") {
    return response.value;
  }
  return null;
}

// function getHeaders(): Record<string, string> | undefined {
//   return undefined;
// }
export async function promptNewRequest(config: Config): Promise<{
  request: RequestFile;
  environment: string;
}> {
  // Get environment
  const environment = await getEnvironment(config);
  const method = await getMethod();
  const url = await getRequestUrl();
  // Get headers
  // const headers = getHeaders();
  // Get Body (edit with vim?)

  return {
    request: {
      name: "Custom request",
      method: method ?? "GET",
      url: url ?? "",
    },
    environment: environment ?? "dev",
  };
}
