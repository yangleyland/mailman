import { CookieGroup, RequestFile } from "../types";
import prompts from "prompts";

export async function resolveCookieHeaders(
  request: RequestFile,
  cookies: CookieGroup[],
): Promise<RequestFile | undefined> {
  const choices = [];
  if (!cookies) {
    return undefined;
  }

  let resCookies: CookieGroup;
  for (const cookie of cookies ?? []) {
    choices.push({ title: cookie.name, value: cookie });
  }
  if (cookies.length > 1) {
    const response = await prompts({
      type: "select",
      name: "cookie",
      message: "select cookie",
      choices,
    });
    if (!response.cookie) {
      return undefined;
    }
    resCookies = response.cookie as CookieGroup;
  } else {
    resCookies = cookies[0];
  }
  let cookieStr = "";
  for (const [key, value] of Object.entries(resCookies.cookies)) {
    cookieStr += key + "=" + value + "; ";
  }
  if (cookieStr.endsWith("; ")) {
    cookieStr = cookieStr.slice(0, -2);
  }

  if (request?.headers) {
    request.headers["Cookie"] = cookieStr;
  } else {
    request.headers = {};
    request.headers["Cookie"] = cookieStr;
  }
  return request;
}
