import type {
  AppState,
  AppStore,
  DeepPartial,
  FavoritesState,
  HeaderMode,
  HydratedAppState,
  MediaItem,
  MediaKind,
  MovieListKey,
  NewToastInput,
  PersistPath,
  PromoState,
  RequestEntry,
  ToastKind,
  UiToast,
  UiModalName,
} from "./app.types";

export const APP_STATE_VERSION = 1;

export const APP_STORAGE_KEY = "marco-m-netflix:app-state:v1";
const FAVORITES_DEFAULT_PROFILE = "default";

export const persistWhitelist: readonly PersistPath[] = [
  "movies.search",
  "favorites.idsByUser",
  "favorites.lastUpdatedAt",
  "ui.navigation.searchOpen",
];

const HEADER_MODES: readonly HeaderMode[] = ["transparent", "solid"];
const MODAL_NAMES: readonly UiModalName[] = ["moviePreview", "videoPlayer"];

const EMPTY_REQUEST_ENTRY: RequestEntry = {
  loading: false,
  error: null,
  statusCode: null,
  startedAt: null,
  endedAt: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNumber(value);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function createToastId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2, 10);
  return `toast-${Date.now()}-${random}`;
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function deepMerge<T extends object>(target: T, patch: DeepPartial<T>): void {
  const targetRecord = target as unknown as Record<string, unknown>;
  const patchRecord = patch as unknown as Record<string, unknown>;

  Object.keys(patchRecord).forEach((key) => {
    const patchValue = patchRecord[key];

    if (patchValue === undefined) {
      return;
    }

    if (Array.isArray(patchValue)) {
      targetRecord[key] = deepClone(patchValue);
      return;
    }

    if (isRecord(patchValue)) {
      const targetValue = targetRecord[key];
      if (!isRecord(targetValue)) {
        targetRecord[key] = {};
      }

      deepMerge(targetRecord[key] as Record<string, unknown>, patchValue as Record<string, unknown>);
      return;
    }

    targetRecord[key] = patchValue;
  });
}

function getPathValue(source: unknown, path: string): unknown {
  const segments = path.split(".");
  let cursor: unknown = source;

  for (const segment of segments) {
    if (!isRecord(cursor)) {
      return undefined;
    }

    cursor = cursor[segment];
  }

  return cursor;
}

function setPathValue(target: Record<string, unknown>, path: string, value: unknown): void {
  const segments = path.split(".");
  const lastIndex = segments.length - 1;
  let cursor: Record<string, unknown> = target;

  for (let index = 0; index < lastIndex; index += 1) {
    const segment = segments[index];
    const nextValue = cursor[segment];

    if (!isRecord(nextValue)) {
      cursor[segment] = {};
    }

    cursor = cursor[segment] as Record<string, unknown>;
  }

  cursor[segments[lastIndex]] = deepClone(value);
}

function sanitizeMediaKind(value: unknown): MediaKind | null {
  return value === "movie" || value === "series" ? value : null;
}

function sanitizeMediaItem(value: unknown): MediaItem | null {
  const source = asRecord(value);
  if (!source) {
    return null;
  }

  if (!isNumber(source.id)) {
    return null;
  }

  const kind = sanitizeMediaKind(source.kind);
  if (!kind) {
    return null;
  }

  if (!isString(source.title)) {
    return null;
  }

  return {
    id: source.id,
    kind,
    title: source.title,
    overview: isNullableString(source.overview) ? source.overview : null,
    posterPath: isNullableString(source.posterPath) ? source.posterPath : null,
    backdropPath: isNullableString(source.backdropPath) ? source.backdropPath : null,
    releaseDate: isNullableString(source.releaseDate) ? source.releaseDate : null,
    voteAverage: isNullableNumber(source.voteAverage) ? source.voteAverage : null,
    language: isNullableString(source.language) ? source.language : null,
    trailerKey: isNullableString(source.trailerKey) ? source.trailerKey : null,
  };
}

function sanitizeMediaList(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: MediaItem[] = [];

  for (const candidate of value) {
    const item = sanitizeMediaItem(candidate);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

function sanitizeFavorites(value: unknown): Partial<FavoritesState> {
  const source = asRecord(value);
  if (!source) {
    return {};
  }

  const result: Partial<FavoritesState> = {};

  if (isRecord(source.idsByUser)) {
    const idsByUser: Record<string, number[]> = {};

    Object.entries(source.idsByUser).forEach(([userId, rawIds]) => {
      if (!Array.isArray(rawIds)) {
        return;
      }

      const ids = rawIds.filter((id): id is number => isNumber(id));
      idsByUser[userId] = ids;
    });

    result.idsByUser = idsByUser;
  }

  if (isNullableString(source.lastUpdatedAt)) {
    result.lastUpdatedAt = source.lastUpdatedAt;
  }

  return result;
}

function sanitizeRequestEntry(value: unknown): RequestEntry | null {
  const source = asRecord(value);
  if (!source) {
    return null;
  }

  return {
    loading: isBoolean(source.loading) ? source.loading : false,
    error: isNullableString(source.error) ? source.error : null,
    statusCode: isNullableNumber(source.statusCode) ? source.statusCode : null,
    startedAt: isNullableNumber(source.startedAt) ? source.startedAt : null,
    endedAt: isNullableNumber(source.endedAt) ? source.endedAt : null,
  };
}

export function createInitialAppState(): AppState {
  return {
    movies: {
      search: {
        query: "",
        language: "en-US",
      },
      lists: {
        popularMovies: [],
        popularSeries: [],
        searchMovies: [],
        searchSeries: [],
        byId: {},
      },
      promo: {
        movieId: null,
        title: null,
        trailerKey: null,
        source: "static",
      },
      selectedMovie: {
        id: null,
        kind: null,
        trailerKey: null,
      },
    },
    favorites: {
      idsByUser: {
        [FAVORITES_DEFAULT_PROFILE]: [],
      },
      lastUpdatedAt: null,
    },
    ui: {
      navigation: {
        searchOpen: false,
        headerMode: "transparent",
        scrollY: 0,
      },
      modals: {
        currentModal: null,
      },
      toasts: [],
    },
    requests: {
      byKey: {},
    },
    meta: {
      stateVersion: APP_STATE_VERSION,
      hydrated: false,
    },
  };
}

export function sanitizeHydratedState(input: unknown): HydratedAppState {
  const source = asRecord(input);
  if (!source) {
    return {};
  }

  const sanitized: HydratedAppState = {};

  if (isRecord(source.movies)) {
    const movies: NonNullable<HydratedAppState["movies"]> = {};

    if (isRecord(source.movies.search)) {
      const search: NonNullable<HydratedAppState["movies"]>["search"] = {};

      if (isString(source.movies.search.query)) {
        search.query = source.movies.search.query;
      }

      if (isString(source.movies.search.language)) {
        search.language = source.movies.search.language;
      }

      movies.search = search;
    }

    if (isRecord(source.movies.lists)) {
      const lists: NonNullable<HydratedAppState["movies"]>["lists"] = {};

      lists.popularMovies = sanitizeMediaList(source.movies.lists.popularMovies);
      lists.popularSeries = sanitizeMediaList(source.movies.lists.popularSeries);
      lists.searchMovies = sanitizeMediaList(source.movies.lists.searchMovies);
      lists.searchSeries = sanitizeMediaList(source.movies.lists.searchSeries);

      if (isRecord(source.movies.lists.byId)) {
        const byId: Record<string, MediaItem> = {};

        Object.entries(source.movies.lists.byId).forEach(([key, item]) => {
          const sanitizedItem = sanitizeMediaItem(item);
          if (sanitizedItem) {
            byId[key] = sanitizedItem;
          }
        });

        lists.byId = byId;
      }

      movies.lists = lists;
    }

    if (isRecord(source.movies.promo)) {
      const promo: NonNullable<HydratedAppState["movies"]>["promo"] = {};

      if (isNullableNumber(source.movies.promo.movieId)) {
        promo.movieId = source.movies.promo.movieId;
      }

      if (isNullableString(source.movies.promo.title)) {
        promo.title = source.movies.promo.title;
      }

      if (isNullableString(source.movies.promo.trailerKey)) {
        promo.trailerKey = source.movies.promo.trailerKey;
      }

      if (source.movies.promo.source === "static" || source.movies.promo.source === "api") {
        promo.source = source.movies.promo.source;
      }

      movies.promo = promo;
    }

    if (isRecord(source.movies.selectedMovie)) {
      const selectedMovie: NonNullable<HydratedAppState["movies"]>["selectedMovie"] = {};

      if (isNullableNumber(source.movies.selectedMovie.id)) {
        selectedMovie.id = source.movies.selectedMovie.id;
      }

      const selectedKind = sanitizeMediaKind(source.movies.selectedMovie.kind);
      if (selectedKind !== null || source.movies.selectedMovie.kind === null) {
        selectedMovie.kind = selectedKind;
      }

      if (isNullableString(source.movies.selectedMovie.trailerKey)) {
        selectedMovie.trailerKey = source.movies.selectedMovie.trailerKey;
      }

      movies.selectedMovie = selectedMovie;
    }

    sanitized.movies = movies;
  }

  if (source.favorites !== undefined) {
    sanitized.favorites = sanitizeFavorites(source.favorites);
    if (sanitized.favorites.idsByUser && !sanitized.favorites.idsByUser[FAVORITES_DEFAULT_PROFILE]) {
      sanitized.favorites.idsByUser[FAVORITES_DEFAULT_PROFILE] = [];
    }
  }

  if (isRecord(source.ui)) {
    const ui: NonNullable<HydratedAppState["ui"]> = {};

    if (isRecord(source.ui.navigation)) {
      const navigation: NonNullable<HydratedAppState["ui"]>["navigation"] = {};

      if (isBoolean(source.ui.navigation.searchOpen)) {
        navigation.searchOpen = source.ui.navigation.searchOpen;
      }

      if (isString(source.ui.navigation.headerMode) && HEADER_MODES.includes(source.ui.navigation.headerMode as HeaderMode)) {
        navigation.headerMode = source.ui.navigation.headerMode as HeaderMode;
      }

      if (isNumber(source.ui.navigation.scrollY)) {
        navigation.scrollY = source.ui.navigation.scrollY;
      }

      ui.navigation = navigation;
    }

    if (isRecord(source.ui.modals)) {
      const modals: NonNullable<HydratedAppState["ui"]>["modals"] = {};

      if (
        source.ui.modals.currentModal === null ||
        (isString(source.ui.modals.currentModal) && MODAL_NAMES.includes(source.ui.modals.currentModal as UiModalName))
      ) {
        modals.currentModal = source.ui.modals.currentModal as UiModalName | null;
      }

      ui.modals = modals;
    }

    if (Array.isArray(source.ui.toasts)) {
      const toasts = source.ui.toasts
        .map((candidate) => {
          const toast = asRecord(candidate);
          if (!toast || !isString(toast.id) || !isString(toast.message)) {
            return null;
          }

          const kind = toast.kind;
          if (kind !== "info" && kind !== "success" && kind !== "warning" && kind !== "error") {
            return null;
          }

          const normalizedKind = kind as ToastKind;

          return {
            id: toast.id,
            message: toast.message,
            kind: normalizedKind,
            createdAt: isNumber(toast.createdAt) ? toast.createdAt : Date.now(),
            ttlMs: isNullableNumber(toast.ttlMs) ? toast.ttlMs : null,
          };
        })
        .filter((value): value is UiToast => value !== null);

      ui.toasts = toasts;
    }

    sanitized.ui = ui;
  }

  if (isRecord(source.requests) && isRecord(source.requests.byKey)) {
    const byKey: Record<string, RequestEntry> = {};

    Object.entries(source.requests.byKey).forEach(([key, rawEntry]) => {
      const entry = sanitizeRequestEntry(rawEntry);
      if (entry) {
        byKey[key] = entry;
      }
    });

    sanitized.requests = { byKey };
  }

  if (isRecord(source.meta)) {
    const meta: HydratedAppState["meta"] = {};

    if (isNumber(source.meta.stateVersion)) {
      meta.stateVersion = source.meta.stateVersion;
    }

    if (isBoolean(source.meta.hydrated)) {
      meta.hydrated = source.meta.hydrated;
    }

    sanitized.meta = meta;
  }

  return sanitized;
}

export function hydrateFromStorage(): HydratedAppState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const serialized = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!serialized) {
      return {};
    }

    const parsed = JSON.parse(serialized) as unknown;
    return sanitizeHydratedState(parsed);
  } catch {
    return {};
  }
}

export function getPersistedSnapshot(state: AppState): HydratedAppState {
  const snapshot: Record<string, unknown> = {};

  persistWhitelist.forEach((path) => {
    const value = getPathValue(state, path);
    if (value !== undefined) {
      setPathValue(snapshot, path, value);
    }
  });

  snapshot.meta = {
    stateVersion: state.meta.stateVersion,
    hydrated: true,
  };

  return sanitizeHydratedState(snapshot);
}

export function persistToStorage(state: AppState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const snapshot = getPersistedSnapshot(state);
    window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage errors (quota, serialization, private mode).
  }
}

export function createAppStore(): AppStore {
  const state = createInitialAppState();

  const store: AppStore = {
    state,
    hydrate(partialState) {
      const sanitized = sanitizeHydratedState(partialState);
      deepMerge(store.state, sanitized);
      store.state.meta.stateVersion = APP_STATE_VERSION;
      store.state.meta.hydrated = true;
    },
    resetState() {
      const fresh = createInitialAppState();
      Object.assign(store.state, fresh);
    },
    setSearchQuery(query) {
      store.state.movies.search.query = query;
    },
    setSearchLanguage(language) {
      store.state.movies.search.language = language;
    },
    upsertMovies(listKey, items) {
      store.state.movies.lists[listKey] = items;
      items.forEach((item) => {
        store.state.movies.lists.byId[String(item.id)] = item;
      });
    },
    upsertMovieById(item) {
      store.state.movies.lists.byId[String(item.id)] = item;
    },
    setPromo(promo) {
      store.state.movies.promo = {
        ...store.state.movies.promo,
        ...promo,
      };
    },
    openSelectedMovie(id, kind, trailerKey = null) {
      store.state.movies.selectedMovie.id = id;
      store.state.movies.selectedMovie.kind = kind;
      store.state.movies.selectedMovie.trailerKey = trailerKey;
    },
    closeSelectedMovie() {
      store.state.movies.selectedMovie.id = null;
      store.state.movies.selectedMovie.kind = null;
      store.state.movies.selectedMovie.trailerKey = null;
    },
    toggleFavorite(mediaId) {
      if (!store.state.favorites.idsByUser[FAVORITES_DEFAULT_PROFILE]) {
        store.state.favorites.idsByUser[FAVORITES_DEFAULT_PROFILE] = [];
      }

      const ids = store.state.favorites.idsByUser[FAVORITES_DEFAULT_PROFILE];
      const index = ids.indexOf(mediaId);

      if (index >= 0) {
        ids.splice(index, 1);
      } else {
        ids.push(mediaId);
      }

      store.state.favorites.lastUpdatedAt = new Date().toISOString();
    },
    setHeaderMode(mode) {
      store.state.ui.navigation.headerMode = mode;
    },
    setNavigationScrollY(scrollY) {
      store.state.ui.navigation.scrollY = scrollY;
    },
    setSearchOpen(open) {
      store.state.ui.navigation.searchOpen = open;
    },
    openModal(modal) {
      store.state.ui.modals.currentModal = modal;
    },
    closeModal() {
      store.state.ui.modals.currentModal = null;
    },
    pushToast(toastInput) {
      const toastId = createToastId();
      const toast: UiToast = {
        id: toastId,
        message: toastInput.message,
        kind: toastInput.kind ?? "info",
        createdAt: Date.now(),
        ttlMs: toastInput.ttlMs ?? 4500,
      };

      store.state.ui.toasts.push(toast);
      return toastId;
    },
    removeToast(toastId) {
      const index = store.state.ui.toasts.findIndex((item) => item.id === toastId);
      if (index >= 0) {
        store.state.ui.toasts.splice(index, 1);
      }
    },
    setRequestState(key, patch) {
      const current = store.state.requests.byKey[key] ?? { ...EMPTY_REQUEST_ENTRY };
      store.state.requests.byKey[key] = {
        ...current,
        ...patch,
      };
    },
    clearRequestState(key) {
      delete store.state.requests.byKey[key];
    },
  };

  return store;
}
