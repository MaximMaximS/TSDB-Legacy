import { ValidatorError } from "./errors";

// Return string, undefined, or throw error
export function stringOrUndefined(
  str: unknown,
  path: string
): string | undefined {
  if (str === undefined) {
    return;
  }
  if (typeof str === "string") {
    return str;
  }
  throw new ValidatorError(path, "string");
}

// Return string or throw error
export function string(str: unknown, path: string): string {
  if (typeof str === "string") {
    return str;
  }
  throw new ValidatorError(path, "required");
}

export function escapeRegExp(query: string) {
  const chars = /[$()*+.?[\\\]^{|}]/g;

  return new RegExp(chars.source).test(query)
    ? query.replace(chars, "\\$&")
    : query;
}

export function number(num: unknown, path: string): number {
  if (typeof num === "number") {
    return num;
  }
  if (typeof num === "string") {
    const parsed = Number.parseInt(num, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  throw new ValidatorError(path, "number");
}
