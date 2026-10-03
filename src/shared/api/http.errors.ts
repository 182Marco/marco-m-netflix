import type { HttpMethod } from "./http.types";

export type HttpErrorCode =
  | "HTTP_ERROR"
  | "NETWORK_ERROR"
  | "TIMEOUT_ERROR"
  | "ABORT_ERROR"
  | "PARSE_ERROR";

export interface HttpErrorDetails {
  code: HttpErrorCode;
  method: HttpMethod;
  url: string;
  requestId: string;
  statusCode?: number;
  retriable: boolean;
  cause?: unknown;
}

export class HttpError extends Error {
  public readonly code: HttpErrorCode;
  public readonly method: HttpMethod;
  public readonly url: string;
  public readonly requestId: string;
  public readonly statusCode?: number;
  public readonly retriable: boolean;
  public readonly cause?: unknown;

  public constructor(message: string, details: HttpErrorDetails) {
    super(message);
    this.name = "HttpError";
    this.code = details.code;
    this.method = details.method;
    this.url = details.url;
    this.requestId = details.requestId;
    this.statusCode = details.statusCode;
    this.retriable = details.retriable;
    this.cause = details.cause;
  }
}

export class NetworkError extends HttpError {
  public constructor(message: string, details: Omit<HttpErrorDetails, "code" | "retriable">) {
    super(message, {
      ...details,
      code: "NETWORK_ERROR",
      retriable: true,
    });
    this.name = "NetworkError";
  }
}

export class TimeoutError extends HttpError {
  public constructor(message: string, details: Omit<HttpErrorDetails, "code" | "retriable">) {
    super(message, {
      ...details,
      code: "TIMEOUT_ERROR",
      retriable: true,
    });
    this.name = "TimeoutError";
  }
}

export class AbortRequestError extends HttpError {
  public constructor(message: string, details: Omit<HttpErrorDetails, "code" | "retriable">) {
    super(message, {
      ...details,
      code: "ABORT_ERROR",
      retriable: false,
    });
    this.name = "AbortRequestError";
  }
}

export class HttpStatusError extends HttpError {
  public readonly responseBody?: unknown;

  public constructor(
    message: string,
    details: Omit<HttpErrorDetails, "code" | "retriable"> & { responseBody?: unknown },
  ) {
    super(message, {
      ...details,
      code: "HTTP_ERROR",
      retriable: details.statusCode !== undefined ? details.statusCode >= 500 : false,
    });
    this.name = "HttpStatusError";
    this.responseBody = details.responseBody;
  }
}

export class ParseError extends HttpError {
  public constructor(message: string, details: Omit<HttpErrorDetails, "code" | "retriable">) {
    super(message, {
      ...details,
      code: "PARSE_ERROR",
      retriable: false,
    });
    this.name = "ParseError";
  }
}

export function isAbortError(value: unknown): boolean {
  if (value instanceof AbortRequestError) {
    return true;
  }

  if (value instanceof DOMException && value.name === "AbortError") {
    return true;
  }

  return Boolean(
    value &&
      typeof value === "object" &&
      "name" in value &&
      (value as { name?: string }).name === "AbortError",
  );
}

export function toHttpError(value: unknown): HttpError {
  if (value instanceof HttpError) {
    return value;
  }

  return new HttpError("Unknown HTTP error", {
    code: "HTTP_ERROR",
    method: "GET",
    url: "unknown",
    requestId: "unknown",
    retriable: false,
    cause: value,
  });
}
