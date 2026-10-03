import { createHttpClient } from "../../../shared/api/http.client";
import { createJsonHeadersInterceptor, createTmdbApiKeyInterceptor } from "../../../shared/api/http.interceptors";
import type { HttpClient, HttpClientConfig } from "../../../shared/api/http.types";
import {
  mapPagedMoviesDtoToDomain,
  mapPagedSeriesDtoToDomain,
  pickBestTrailerKey,
  type MediaItem,
  type PagedResult,
  type TmdbMovieDto,
  type TmdbPagedResponseDto,
  type TmdbTvDto,
  type TmdbVideosResponseDto,
} from "./movies.mapper";

export interface SearchMoviesPayload {
  query: string;
  language?: string;
  page?: number;
  includeAdult?: boolean;
}

export interface SearchSeriesPayload {
  query: string;
  language?: string;
  page?: number;
  includeAdult?: boolean;
}

export interface PopularPayload {
  language?: string;
  page?: number;
}

export interface TrailerPayload {
  id: number;
  language?: string;
}

export interface TrailerByKindPayload extends TrailerPayload {
  kind: "movie" | "series";
}

export interface MoviesApi {
  searchMovies(payload: SearchMoviesPayload): Promise<PagedResult<MediaItem>>;
  searchSeries(payload: SearchSeriesPayload): Promise<PagedResult<MediaItem>>;
  getPopularMovies(payload?: PopularPayload): Promise<PagedResult<MediaItem>>;
  getPopularSeries(payload?: PopularPayload): Promise<PagedResult<MediaItem>>;
  getMovieTrailerKey(payload: TrailerPayload): Promise<string | null>;
  getSeriesTrailerKey(payload: TrailerPayload): Promise<string | null>;
  getTrailerKey(payload: TrailerByKindPayload): Promise<string | null>;
}

export interface TmdbMoviesApiConfig {
  apiKey: string;
  baseUrl?: string;
  defaultLanguage?: string;
  httpClient?: HttpClient;
  httpClientConfig?: Omit<HttpClientConfig, "baseUrl">;
}

const TMDB_DEFAULT_BASE_URL = "https://api.themoviedb.org/3";
const SEARCH_TTL_MS = 30_000;
const POPULAR_TTL_MS = 5 * 60_000;
const VIDEOS_TTL_MS = 10 * 60_000;

export class TmdbMoviesApi implements MoviesApi {
  private readonly http: HttpClient;
  private readonly defaultLanguage: string;

  public constructor(httpClient: HttpClient, defaultLanguage = "en-US") {
    this.http = httpClient;
    this.defaultLanguage = defaultLanguage;
  }

  public async searchMovies(payload: SearchMoviesPayload): Promise<PagedResult<MediaItem>> {
    const response = await this.http.get<TmdbPagedResponseDto<TmdbMovieDto>>({
      url: "/search/movie",
      query: {
        query: payload.query,
        language: payload.language ?? this.defaultLanguage,
        page: payload.page ?? 1,
        include_adult: payload.includeAdult ?? false,
      },
      dedupeKey: "tmdb:search:movie",
      dedupeStrategy: "cancel-previous",
      cache: {
        enabled: true,
        ttlMs: SEARCH_TTL_MS,
      },
    });

    return mapPagedMoviesDtoToDomain(response.data);
  }

  public async searchSeries(payload: SearchSeriesPayload): Promise<PagedResult<MediaItem>> {
    const response = await this.http.get<TmdbPagedResponseDto<TmdbTvDto>>({
      url: "/search/tv",
      query: {
        query: payload.query,
        language: payload.language ?? this.defaultLanguage,
        page: payload.page ?? 1,
        include_adult: payload.includeAdult ?? false,
      },
      dedupeKey: "tmdb:search:tv",
      dedupeStrategy: "cancel-previous",
      cache: {
        enabled: true,
        ttlMs: SEARCH_TTL_MS,
      },
    });

    return mapPagedSeriesDtoToDomain(response.data);
  }

  public async getPopularMovies(payload: PopularPayload = {}): Promise<PagedResult<MediaItem>> {
    const language = payload.language ?? this.defaultLanguage;
    const page = payload.page ?? 1;

    const response = await this.http.get<TmdbPagedResponseDto<TmdbMovieDto>>({
      url: "/movie/popular",
      query: {
        language,
        page,
      },
      dedupeKey: `tmdb:popular:movie:${language}:${page}`,
      dedupeStrategy: "reuse-inflight",
      cache: {
        enabled: true,
        ttlMs: POPULAR_TTL_MS,
      },
    });

    return mapPagedMoviesDtoToDomain(response.data);
  }

  public async getPopularSeries(payload: PopularPayload = {}): Promise<PagedResult<MediaItem>> {
    const language = payload.language ?? this.defaultLanguage;
    const page = payload.page ?? 1;

    const response = await this.http.get<TmdbPagedResponseDto<TmdbTvDto>>({
      url: "/tv/popular",
      query: {
        language,
        page,
      },
      dedupeKey: `tmdb:popular:tv:${language}:${page}`,
      dedupeStrategy: "reuse-inflight",
      cache: {
        enabled: true,
        ttlMs: POPULAR_TTL_MS,
      },
    });

    return mapPagedSeriesDtoToDomain(response.data);
  }

  public async getMovieTrailerKey(payload: TrailerPayload): Promise<string | null> {
    const videos = await this.getMovieVideos(payload);
    return pickBestTrailerKey(videos);
  }

  public async getSeriesTrailerKey(payload: TrailerPayload): Promise<string | null> {
    const videos = await this.getSeriesVideos(payload);
    return pickBestTrailerKey(videos);
  }

  public async getTrailerKey(payload: TrailerByKindPayload): Promise<string | null> {
    if (payload.kind === "movie") {
      return this.getMovieTrailerKey(payload);
    }

    return this.getSeriesTrailerKey(payload);
  }

  private async getMovieVideos(payload: TrailerPayload): Promise<TmdbVideosResponseDto> {
    const language = payload.language ?? this.defaultLanguage;
    const response = await this.http.get<TmdbVideosResponseDto>({
      url: `/movie/${payload.id}/videos`,
      query: { language },
      dedupeKey: `tmdb:movie:videos:${payload.id}:${language}`,
      dedupeStrategy: "reuse-inflight",
      cache: {
        enabled: true,
        ttlMs: VIDEOS_TTL_MS,
      },
    });

    return response.data;
  }

  private async getSeriesVideos(payload: TrailerPayload): Promise<TmdbVideosResponseDto> {
    const language = payload.language ?? this.defaultLanguage;
    const response = await this.http.get<TmdbVideosResponseDto>({
      url: `/tv/${payload.id}/videos`,
      query: { language },
      dedupeKey: `tmdb:tv:videos:${payload.id}:${language}`,
      dedupeStrategy: "reuse-inflight",
      cache: {
        enabled: true,
        ttlMs: VIDEOS_TTL_MS,
      },
    });

    return response.data;
  }
}

export function createTmdbMoviesApi(config: TmdbMoviesApiConfig): MoviesApi {
  const httpClient =
    config.httpClient ??
    createHttpClient({
      baseUrl: config.baseUrl ?? TMDB_DEFAULT_BASE_URL,
      ...(config.httpClientConfig ?? {}),
      interceptors: [
        createJsonHeadersInterceptor(),
        createTmdbApiKeyInterceptor({ apiKey: config.apiKey }),
        ...((config.httpClientConfig?.interceptors ?? []) as []),
      ],
    });

  return new TmdbMoviesApi(httpClient, config.defaultLanguage ?? "en-US");
}
