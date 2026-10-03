import { isAbortError, toHttpError } from "../../../shared/api/http.errors";
import type { AppStore } from "../../../store/app.types";
import type { AppServices } from "../services/app-services";

export const MOVIES_SEARCH_REQUEST_KEY = "movies:search";

function nowMs(): number {
  return Date.now();
}

function normalizeQuery(query: string): string {
  return query.trim();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  const httpError = toHttpError(error);
  if (httpError.message.trim().length > 0) {
    return httpError.message;
  }

  return "Unexpected error";
}

export function clearSearchedLists(store: AppStore): void {
  store.upsertMovies("searchMovies", []);
  store.upsertMovies("searchSeries", []);
  store.clearRequestState(MOVIES_SEARCH_REQUEST_KEY);
}

export async function searchMoviesAndSeries(store: AppStore, services: AppServices, signal?: AbortSignal): Promise<void> {
  const query = normalizeQuery(store.state.movies.search.query);
  const language = store.state.movies.search.language;

  if (query.length === 0) {
    clearSearchedLists(store);
    return;
  }

  const startedAt = nowMs();
  store.setRequestState(MOVIES_SEARCH_REQUEST_KEY, {
    loading: true,
    error: null,
    statusCode: null,
    startedAt,
    endedAt: null,
  });

  try {
    const [movies, series] = await Promise.all([
      services.moviesApi.searchMovies({
        query,
        language,
        page: 1,
      }),
      services.moviesApi.searchSeries({
        query,
        language,
        page: 1,
      }),
    ]);

    if (signal?.aborted) {
      return;
    }

    if (normalizeQuery(store.state.movies.search.query) !== query || store.state.movies.search.language !== language) {
      return;
    }

    store.upsertMovies("searchMovies", movies.items);
    store.upsertMovies("searchSeries", series.items);
    store.setRequestState(MOVIES_SEARCH_REQUEST_KEY, {
      loading: false,
      error: null,
      endedAt: nowMs(),
    });
  } catch (error) {
    const aborted = isAbortError(error);
    store.setRequestState(MOVIES_SEARCH_REQUEST_KEY, {
      loading: false,
      error: aborted ? null : getErrorMessage(error),
      endedAt: nowMs(),
    });
  }
}