import type { HttpInterceptor } from "./http.types";

interface AuthInterceptorOptions {
  getToken: () => string | null | undefined;
  headerName?: string;
  scheme?: string;
}

export function createAuthInterceptor(options: AuthInterceptorOptions): HttpInterceptor {
  const headerName = options.headerName ?? "Authorization";
  const scheme = options.scheme ?? "Bearer";

  return {
    onRequest(context) {
      const token = options.getToken();
      if (!token) {
        return context;
      }

      const headers = {
        ...(context.config.headers ?? {}),
        [headerName]: `${scheme} ${token}`,
      };

      return {
        ...context,
        config: {
          ...context.config,
          headers,
        },
      };
    },
  };
}

interface TmdbApiKeyInterceptorOptions {
  apiKey: string;
  queryParamName?: string;
}

export function createTmdbApiKeyInterceptor(options: TmdbApiKeyInterceptorOptions): HttpInterceptor {
  const queryParamName = options.queryParamName ?? "api_key";

  return {
    onRequest(context) {
      const query = {
        ...(context.config.query ?? {}),
        [queryParamName]: options.apiKey,
      };

      return {
        ...context,
        config: {
          ...context.config,
          query,
        },
      };
    },
  };
}

export function createJsonHeadersInterceptor(): HttpInterceptor {
  return {
    onRequest(context) {
      const method = context.config.method ?? "GET";
      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(context.config.headers ?? {}),
      };

      if (method !== "GET" && method !== "DELETE" && context.config.body !== undefined) {
        headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      }

      return {
        ...context,
        config: {
          ...context.config,
          headers,
        },
      };
    },
  };
}

interface LoggingInterceptorOptions {
  logger?: Pick<Console, "debug" | "warn">;
}

export function createLoggingInterceptor(options?: LoggingInterceptorOptions): HttpInterceptor {
  const logger = options?.logger ?? console;

  return {
    onResponse(response) {
      logger.debug?.(
        `[HTTP] ${response.meta.method} ${response.meta.url} ${response.meta.statusCode} (${response.meta.durationMs}ms)`
      );
      return response;
    },
    onError(error) {
      logger.warn?.("[HTTP] Request failed", error);
      return error;
    },
  };
}
