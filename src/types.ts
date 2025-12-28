export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestFile {
  name: string;
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  defaultValues?: Record<string, string>;
  body?: unknown;
}

export interface Variables {
  [key: string]: string;
}

export interface Config {
  defaultEnvironment: string;
  environments: Record<string, Variables>;
}

export interface ResolvedRequest {
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}
