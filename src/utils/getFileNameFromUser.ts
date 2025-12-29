import prompts from "prompts";
export async function getFileNameFromUser(): Promise<string | undefined> {
  const response = await prompts({
    type: "text",
    name: "value",
    message: "Enter a file name",
  });
  if (typeof response.value === "string") {
    const res = response.value;
    if (res.endsWith(".json")) {
      return res;
    }
    return res + ".json";
  }
  return undefined;
}
