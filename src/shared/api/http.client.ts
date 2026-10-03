import {
  AbortRequestError,
  HttpStatusError,
  NetworkError,
  ParseError,
  TimeoutError,
  isAbortError,
} from "./http.errors";
import type {
  HttpClient,
  HttpClientConfig,
  HttpInterceptor,
  HttpMethod,
  HttpRequestConfig,
  HttpRequestContext,
  HttpResponse,
  LoadingState,
  LoadingStateListener,
} from "./http.types";

interface CacheEntry {
  expiresAt: number;
  statusCode: number;
  data: unknown;
}

interface InflightEntry {
  controller: AbortController;
  promise: Promise<HttpResponse<unknown>>;
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2, 10);
  return `req-${Date.now()}-${random}`;
}

function normalizeMethod(method?: string): HttpMethod {
  const upper = (method ?? "GET").toUpperCase();
  if (upper === "GET" || upper === "POST" || upper === "PUT" || upper === "PATCH" || upper === "DELETE") {
    return upper;
  }
  return "GET";
}

function mergeAbortSignals(parent: AbortSignal | undefined, childController: AbortController): (() => void) | undefined {
  if (!parent) {
    return undefined;
  }

  if (parent.aborted) {
    childController.abort(parent.reason);
    return undefined;
  }

  const onAbort = () => childController.abort(parent.reason);
  parent.addEventListener("abort", onAbort, { once: true });

  return () => parent.removeEventListener("abort", onAbort);
}

function buildUrl(baseUrl: string, path: string, query: Record<string, string | number | boolean | null | undefined>): string {
  const url = new URL(path, baseUrl);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultQuery: Record<string, string | number | boolean | null | undefined>;
  private readonly requestTimeoutMs?: number;
  private readonly interceptors: HttpInterceptor[];
  private readonly loadingListeners: Set<LoadingStateListener>;
  private readonly loadingByKey: Map<string, number>;
  private readonly cache: Map<string, CacheEntry>;
  private readonly inflightByDedupeKey: Map<string, InflightEntry>;

  public constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.fetchFn = config.fetchFn ?? fetch;
    this.defaultHeaders = { ...(config.defaultHeaders ?? {}) };
    this.defaultQuery = { ...(config.defaultQuery ?? {}) };
    this.requestTimeoutMs = config.requestTimeoutMs;
    this.interceptors = [...(config.interceptors ?? [])];
    this.loadingListeners = new Set(config.loadingListeners ?? []);
    this.loadingByKey = new Map();
    this.cache = new Map();
    this.inflightByDedupeKey = new Map();
  }

  public addInterceptor(interceptor: HttpInterceptor): void {
    this.interceptors.push(interceptor);
  }

  public removeInterceptor(interceptor: HttpInterceptor): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index >= 0) {
      this.interceptors.splice(index, 1);
    }
  }

  public subscribeLoading(listener: LoadingStateListener): () => void {
    this.loadingListeners.add(listener);
    listener(this.getLoadingState());

    return () => {
      this.loadingListeners.delete(listener);
    };
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public cancelByDedupeKey(dedupeKey: string): void {
    const inflight = this.inflightByDedupeKey.get(dedupeKey);
    if (!inflight) {
      return;
    }

    inflight.controller.abort();
    this.inflightByDedupeKey.delete(dedupeKey);
  }

  public request<TResponse, TBody = unknown>(config: HttpRequestConfig<TBody>): Promise<HttpResponse<TResponse>> {
    const method = normalizeMethod(config.method);
    const requestId = createRequestId();
    const startedAt = Date.now();

    let context: HttpRequestContext<TBody> = {
      config: {
        ...config,
        method,
      },
      runtime: {
        requestId,
        startedAt,
        fromCache: false,
      },
    };

    return this.runRequest(context) as Promise<HttpResponse<TResponse>>;
  }

  public get<TResponse>(config: Omit<HttpRequestConfig<never>, "method">): Promise<HttpResponse<TResponse>> {
    return this.request<TResponse>({ ...config, method: "GET" });
  }

  public post<TResponse, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, "method">): Promise<HttpResponse<TResponse>> {
    return this.request<TResponse, TBody>({ ...config, method: "POST" });
  }

  public put<TResponse, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, "method">): Promise<HttpResponse<TResponse>> {
    return this.request<TResponse, TBody>({ ...config, method: "PUT" });
  }

  public patch<TResponse, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, "method">): Promise<HttpResponse<TResponse>> {
    return this.request<TResponse, TBody>({ ...config, method: "PATCH" });
  }

  public delete<TResponse>(config: Omit<HttpRequestConfig<never>, "method">): Promise<HttpResponse<TResponse>> {
    return this.request<TResponse>({ ...config, method: "DELETE" });
  }

  private async runRequest<TBody>(initialContext: HttpRequestContext<TBody>): Promise<HttpResponse<unknown>> {
    const context = await this.runRequestInterceptors(initialContext);
    const method = normalizeMethod(context.config.method);
    const loadingKey = context.config.dedupeKey ?? `${method} ${context.config.url}`;

    const query = {
      ...this.defaultQuery,
      ...(context.config.query ?? {}),
    };

    const url = buildUrl(this.baseUrl, context.config.url, query);

    const cacheOptions = context.config.cache;
    const cacheEnabled = method === "GET" && Boolean(cacheOptions?.enabled ?? true) && Boolean(cacheOptions?.ttlMs);
    const cacheKey = cacheOptions?.key ?? `${method}:${url}`;

    if (cacheEnabled) {
      const cacheEntry = this.cache.get(cacheKey);
      if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
        const endedAt = Date.now();
        const cachedResponse: HttpResponse<unknown> = {
          data: cacheEntry.data,
          meta: {
            requestId: context.runtime.requestId,
            method,
            url,
            statusCode: cacheEntry.statusCode,
            startedAt: context.runtime.startedAt,
            endedAt,
            durationMs: endedAt - context.runtime.startedAt,
            fromCache: true,
          },
        };

        return this.runResponseInterceptors(cachedResponse);
      }

      this.cache.delete(cacheKey);
    }

    const dedupeKey = context.config.dedupeKey;
    const dedupeStrategy = context.config.dedupeStrategy ?? "parallel";

    if (dedupeKey) {
      const existing = this.inflightByDedupeKey.get(dedupeKey);
      if (existing && dedupeStrategy === "reuse-inflight") {
        return existing.promise;
      }

      if (existing && dedupeStrategy === "cancel-previous") {
        existing.controller.abort();
        this.inflightByDedupeKey.delete(dedupeKey);
      }
    }

    const controller = new AbortController();
    const detachParentAbort = mergeAbortSignals(context.config.signal, controller);

    const timeoutMs = context.config.timeoutMs ?? this.requestTimeoutMs;
    let timedOut = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (timeoutMs && timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
    }

    const promise = this.executeRequest({
      context,
      method,
      url,
      cacheEnabled,
      cacheKey,
      loadingKey,
      controller,
      timedOutRef: () => timedOut,
    }).finally(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      detachParentAbort?.();

      if (dedupeKey) {
        const current = this.inflightByDedupeKey.get(dedupeKey);
        if (current?.promise === promise) {
          this.inflightByDedupeKey.delete(dedupeKey);
        }
      }
    });

    if (dedupeKey && dedupeStrategy !== "parallel") {
      this.inflightByDedupeKey.set(dedupeKey, {
        controller,
        promise,
      });
    }

    return promise;
  }

  private async executeRequest(params: {
    context: HttpRequestContext<unknown>;
    method: HttpMethod;
    url: string;
    cacheEnabled: boolean;
    cacheKey: string;
    loadingKey: string;
    controller: AbortController;
    timedOutRef: () => boolean;
  }): Promise<HttpResponse<unknown>> {
    this.incrementLoading(params.loadingKey);

    try {
      const headers = {
        ...this.defaultHeaders,
        ...(params.context.config.headers ?? {}),
      };

      const requestInit: RequestInit = {
        method: params.method,
        headers,
        signal: params.controller.signal,
      };

      if (params.context.config.body !== undefined && params.method !== "GET") {
        const contentType = headers["Content-Type"] ?? headers["content-type"];
        requestInit.body = contentType?.includes("application/json")
          ? JSON.stringify(params.context.config.body)
          : (params.context.config.body as BodyInit);
      }

      let response: Response;

      try {
        response = await this.fetchFn(params.url, requestInit);
      } catch (error) {
        if (isAbortError(error) || params.controller.signal.aborted) {
          if (params.timedOutRef()) {
            throw new TimeoutError("Request timeout", {
              method: params.method,
              url: params.url,
              requestId: params.context.runtime.requestId,
              cause: error,
            });
          }

          throw new AbortRequestError("Request aborted", {
            method: params.method,
            url: params.url,
            requestId: params.context.runtime.requestId,
            cause: error,
          });
        }

        throw new NetworkError("Network request failed", {
          method: params.method,
          url: params.url,
          requestId: params.context.runtime.requestId,
          cause: error,
        });
      }

      if (!response.ok) {
        const errorBody = await this.tryReadErrorBody(response);
        throw new HttpStatusError(`HTTP ${response.status}`, {
          method: params.method,
          url: params.url,
          requestId: params.context.runtime.requestId,
          statusCode: response.status,
          responseBody: errorBody,
        });
      }

      const data = await this.parseResponseBody(response, params);
      const endedAt = Date.now();

      const rawResponse: HttpResponse<unknown> = {
        data,
        meta: {
          requestId: params.context.runtime.requestId,
          method: params.method,
          url: params.url,
          statusCode: response.status,
          startedAt: params.context.runtime.startedAt,
          endedAt,
          durationMs: endedAt - params.context.runtime.startedAt,
          fromCache: false,
        },
      };

      if (params.cacheEnabled) {
        const ttlMs = params.context.config.cache?.ttlMs ?? 0;
        this.cache.set(params.cacheKey, {
          expiresAt: Date.now() + ttlMs,
          statusCode: response.status,
          data,
        });
      }

      return this.runResponseInterceptors(rawResponse);
    } catch (rawError) {
      const error = await this.runErrorInterceptors(rawError, params.context);
      throw error;
    } finally {
      this.decrementLoading(params.loadingKey);
    }
  }

  private async parseResponseBody(
    response: Response,
    params: {
      context: HttpRequestContext<unknown>;
      method: HttpMethod;
      url: string;
    },
  ): Promise<unknown> {
    const parseAs = params.context.config.parseAs ?? "json";

    if (parseAs === "raw") {
      return response;
    }

    if (response.status === 204) {
      return null;
    }

    if (parseAs === "text") {
      return response.text();
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ParseError("Unable to parse JSON response", {
        method: params.method,
        url: params.url,
        requestId: params.context.runtime.requestId,
        statusCode: response.status,
        cause: error,
      });
    }
  }

  private async tryReadErrorBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";

    try {
      if (contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch {
      return undefined;
    }
  }

  private async runRequestInterceptors<TBody>(context: HttpRequestContext<TBody>): Promise<HttpRequestContext<TBody>> {
    let currentContext = context;

    for (const interceptor of this.interceptors) {
      if (!interceptor.onRequest) {
        continue;
      }
      currentContext = await interceptor.onRequest(currentContext);
    }

    return currentContext;
  }

  private async runResponseInterceptors(response: HttpResponse<unknown>): Promise<HttpResponse<unknown>> {
    let currentResponse = response;

    for (const interceptor of this.interceptors) {
      if (!interceptor.onResponse) {
        continue;
      }
      currentResponse = await interceptor.onResponse(currentResponse);
    }

    return currentResponse;
  }

  private async runErrorInterceptors(error: unknown, context: HttpRequestContext<unknown>): Promise<unknown> {
    let currentError = error;

    for (const interceptor of this.interceptors) {
      if (!interceptor.onError) {
        continue;
      }
      currentError = await interceptor.onError(currentError, context);
    }

    return currentError;
  }

  private incrementLoading(key: string): void {
    const value = this.loadingByKey.get(key) ?? 0;
    this.loadingByKey.set(key, value + 1);
    this.emitLoading();
  }

  private decrementLoading(key: string): void {
    const value = this.loadingByKey.get(key) ?? 0;
    const next = Math.max(0, value - 1);

    if (next === 0) {
      this.loadingByKey.delete(key);
    } else {
      this.loadingByKey.set(key, next);
    }

    this.emitLoading();
  }

  private emitLoading(): void {
    const snapshot = this.getLoadingState();
    this.loadingListeners.forEach((listener) => listener(snapshot));
  }

  private getLoadingState(): LoadingState {
    const byKey: Record<string, number> = {};
    let totalPending = 0;

    this.loadingByKey.forEach((count, key) => {
      byKey[key] = count;
      totalPending += count;
    });

    return { totalPending, byKey };
  }
}

export function createHttpClient(config: HttpClientConfig): HttpClient {
  return new FetchHttpClient(config);
}
