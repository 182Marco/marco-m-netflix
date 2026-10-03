import { isAbortError, toHttpError } from "../../../shared/api/http.errors";
import type { AppStore, HeaderMode } from "../../../store/app.types";
import type { AppServices } from "../services/app-services";

const POPULAR_MOVIES_REQUEST_KEY = "movies:popular:movie";
const POPULAR_SERIES_REQUEST_KEY = "movies:popular:series";

function nowMs(): number {
  return Date.now();
}

function isAborted(error: unknown): boolean {
  return isAbortError(error);
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

export async function bootstrapHomeData(
  store: AppStore,
  services: AppServices,
  signal?: AbortSignal,
): Promise<void> {
  const startedAt = nowMs();
  const language = store.state.movies.search.language;

  store.setRequestState(POPULAR_MOVIES_REQUEST_KEY, {
    loading: true,
    error: null,
    statusCode: null,
    startedAt,
    endedAt: null,
  });

  store.setRequestState(POPULAR_SERIES_REQUEST_KEY, {
    loading: true,
    error: null,
    statusCode: null,
    startedAt,
    endedAt: null,
  });

  try {
    const [popularMovies, popularSeries] = await Promise.all([
      services.moviesApi.getPopularMovies({ language, page: 1 }),
      services.moviesApi.getPopularSeries({ language, page: 1 }),
    ]);

    if (signal?.aborted) {
      return;
    }

    store.upsertMovies("popularMovies", popularMovies.items);
    store.upsertMovies("popularSeries", popularSeries.items);

    const promo = popularMovies.items[0] ?? popularSeries.items[0] ?? null;
    if (promo) {
      store.setPromo({
        movieId: promo.id,
        title: promo.title,
        trailerKey: promo.trailerKey,
        source: "api",
      });
    }

    const endedAt = nowMs();

    store.setRequestState(POPULAR_MOVIES_REQUEST_KEY, {
      loading: false,
      error: null,
      endedAt,
    });

    store.setRequestState(POPULAR_SERIES_REQUEST_KEY, {
      loading: false,
      error: null,
      endedAt,
    });
  } catch (error) {
    const aborted = isAborted(error);
    const message = aborted ? null : getErrorMessage(error);
    const endedAt = nowMs();

    store.setRequestState(POPULAR_MOVIES_REQUEST_KEY, {
      loading: false,
      error: message,
      endedAt,
    });

    store.setRequestState(POPULAR_SERIES_REQUEST_KEY, {
      loading: false,
      error: message,
      endedAt,
    });

    if (!aborted) {
      store.pushToast({
        kind: "error",
        message: "Unable to load popular movies and series.",
      });
      throw error;
    }
  }
}

export function applyScrollHeaderMode(store: AppStore, scrollY: number, threshold: number): void {
  const nextMode: HeaderMode = scrollY > threshold ? "solid" : "transparent";

  store.setNavigationScrollY(scrollY);

  if (store.state.ui.navigation.headerMode !== nextMode) {
    store.setHeaderMode(nextMode);
  }
}
