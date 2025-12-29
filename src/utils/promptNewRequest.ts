import { RequestFile, HttpMethod, Config } from "../types";
import { validMethods } from "./constants";
import prompts from "prompts";
import { getBodyWithEditor } from "./getBodyWithEditor";

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

async function getHeaders(): Promise<Record<string, string> | undefined> {
  const headerVals: Record<string, string> = {};
  for (;;) {
    const responseKey = await prompts({
      type: "text",
      name: "key",
      message: "Enter header key or press q to finish",
    });
    if (typeof responseKey.key === "string" && responseKey.key === "q") {
      break;
    }
    const responseValue = await prompts({
      type: "text",
      name: "value",
      message: "Enter header value or press q to finish",
    });
    if (
      typeof responseValue.value === "string" &&
      responseValue.value === "q"
    ) {
      break;
    }
    if (
      typeof responseKey.key === "string" &&
      typeof responseValue.value === "string"
    ) {
      headerVals[responseKey.key] = responseValue.value;
    }
  }
  return headerVals;
}
export async function promptNewRequest(config: Config): Promise<{
  request: RequestFile;
  environment: string;
}> {
  const environment = await getEnvironment(config);
  const method = await getMethod();
  const url = await getRequestUrl();
  const headers = await getHeaders();
  const body = await getBodyWithEditor();

  return {
    request: {
      name: "Custom request",
      method: method ?? "GET",
      url: url ?? "",
      headers,
      body,
    },
    environment: environment ?? "dev",
  };
}
