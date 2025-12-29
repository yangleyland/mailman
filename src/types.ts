export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestFile {
  name: string;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  defaultValues?: Record<string, string>;
  body?: unknown;
  cookies?: boolean;
}
export interface CookieGroup {
  name: string;
  cookies: Record<string, string>;
}

export interface Variables {
  [key: string]: string;
}

export interface Environment {
  variables: Variables;
  cookies?: CookieGroup[];
}
export interface Config {
  defaultEnvironment: string;
  environments: Record<string, Environment>;
}

export interface ResolvedRequest {
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}
