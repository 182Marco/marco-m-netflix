export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type DedupeStrategy = "cancel-previous" | "reuse-inflight" | "parallel";

export type ParseAs = "json" | "text" | "raw";

export interface HttpQueryParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface HttpRequestCacheOptions {
  enabled?: boolean;
  ttlMs: number;
  key?: string;
}

export interface HttpRequestConfig<TBody = unknown> {
  method?: HttpMethod;
  url: string;
  query?: HttpQueryParams;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  parseAs?: ParseAs;
  dedupeKey?: string;
  dedupeStrategy?: DedupeStrategy;
  cache?: HttpRequestCacheOptions;
}

export interface HttpRequestRuntime {
  requestId: string;
  startedAt: number;
  fromCache: boolean;
}

export interface HttpRequestContext<TBody = unknown> {
  config: HttpRequestConfig<TBody>;
  runtime: HttpRequestRuntime;
}

export interface HttpResponseMeta {
  requestId: string;
  method: HttpMethod;
  url: string;
  statusCode: number;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  fromCache: boolean;
}

export interface HttpResponse<TData = unknown> {
  data: TData;
  meta: HttpResponseMeta;
}

export interface HttpInterceptor {
  onRequest?: <TBody = unknown>(context: HttpRequestContext<TBody>) => HttpRequestContext<TBody> | Promise<HttpRequestContext<TBody>>;
  onResponse?: <TData = unknown>(response: HttpResponse<TData>) => HttpResponse<TData> | Promise<HttpResponse<TData>>;
  onError?: (error: unknown, context: HttpRequestContext<unknown>) => unknown | Promise<unknown>;
}

export interface LoadingState {
  totalPending: number;
  byKey: Record<string, number>;
}

export type LoadingStateListener = (state: LoadingState) => void;

export interface HttpClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  defaultQuery?: HttpQueryParams;
  requestTimeoutMs?: number;
  fetchFn?: typeof fetch;
  interceptors?: HttpInterceptor[];
  loadingListeners?: LoadingStateListener[];
}

export interface HttpClient {
  request<TResponse, TBody = unknown>(config: HttpRequestConfig<TBody>): Promise<HttpResponse<TResponse>>;
  get<TResponse>(config: Omit<HttpRequestConfig<never>, "method">): Promise<HttpResponse<TResponse>>;
  post<TResponse, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, "method">): Promise<HttpResponse<TResponse>>;
  put<TResponse, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, "method">): Promise<HttpResponse<TResponse>>;
  patch<TResponse, TBody = unknown>(config: Omit<HttpRequestConfig<TBody>, "method">): Promise<HttpResponse<TResponse>>;
  delete<TResponse>(config: Omit<HttpRequestConfig<never>, "method">): Promise<HttpResponse<TResponse>>;
  addInterceptor(interceptor: HttpInterceptor): void;
  removeInterceptor(interceptor: HttpInterceptor): void;
  subscribeLoading(listener: LoadingStateListener): () => void;
  cancelByDedupeKey(dedupeKey: string): void;
  clearCache(): void;
}
