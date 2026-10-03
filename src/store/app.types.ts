export type Nullable<T> = T | null;

export type HeaderMode = "transparent" | "solid";

export type PromoSource = "static" | "api";

export type MediaKind = "movie" | "series";

export type UiModalName = "moviePreview" | "videoPlayer";

export type ToastKind = "info" | "success" | "warning" | "error";

export type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends (infer U)[]
    ? DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export interface MovieSearchState {
  query: string;
  language: string;
}

export interface MediaItem {
  id: number;
  kind: MediaKind;
  title: string;
  overview: Nullable<string>;
  posterPath: Nullable<string>;
  backdropPath: Nullable<string>;
  releaseDate: Nullable<string>;
  voteAverage: Nullable<number>;
  language: Nullable<string>;
  trailerKey: Nullable<string>;
}

export interface MovieLists {
  popularMovies: MediaItem[];
  popularSeries: MediaItem[];
  searchMovies: MediaItem[];
  searchSeries: MediaItem[];
  byId: Record<string, MediaItem>;
}

export type MovieListKey = Exclude<keyof MovieLists, "byId">;

export interface PromoState {
  movieId: Nullable<number>;
  title: Nullable<string>;
  trailerKey: Nullable<string>;
  source: PromoSource;
}

export interface SelectedMovieState {
  id: Nullable<number>;
  kind: Nullable<MediaKind>;
  trailerKey: Nullable<string>;
}

export interface MoviesState {
  search: MovieSearchState;
  lists: MovieLists;
  promo: PromoState;
  selectedMovie: SelectedMovieState;
}

export interface FavoritesState {
  idsByUser: Record<string, number[]>;
  lastUpdatedAt: Nullable<string>;
}

export interface NavigationState {
  searchOpen: boolean;
  headerMode: HeaderMode;
  scrollY: number;
}

export interface ModalsState {
  currentModal: Nullable<UiModalName>;
}

export interface UiToast {
  id: string;
  message: string;
  kind: ToastKind;
  createdAt: number;
  ttlMs: Nullable<number>;
}

export interface UiState {
  navigation: NavigationState;
  modals: ModalsState;
  toasts: UiToast[];
}

export interface RequestEntry {
  loading: boolean;
  error: Nullable<string>;
  statusCode: Nullable<number>;
  startedAt: Nullable<number>;
  endedAt: Nullable<number>;
}

export interface RequestsState {
  byKey: Record<string, RequestEntry>;
}

export interface MetaState {
  stateVersion: number;
  hydrated: boolean;
}

export interface AppState {
  movies: MoviesState;
  favorites: FavoritesState;
  ui: UiState;
  requests: RequestsState;
  meta: MetaState;
}

export type HydratedAppState = DeepPartial<AppState>;

export type PersistPath =
  | "movies.search"
  | "favorites.idsByUser"
  | "favorites.lastUpdatedAt"
  | "ui.navigation.searchOpen";

export interface NewToastInput {
  message: string;
  kind?: ToastKind;
  ttlMs?: Nullable<number>;
}

export interface AppStore {
  state: AppState;
  hydrate: (partialState: HydratedAppState) => void;
  resetState: () => void;
  setSearchQuery: (query: string) => void;
  setSearchLanguage: (language: string) => void;
  upsertMovies: (listKey: MovieListKey, items: MediaItem[]) => void;
  upsertMovieById: (item: MediaItem) => void;
  setPromo: (promo: Partial<PromoState>) => void;
  openSelectedMovie: (id: number, kind: MediaKind, trailerKey?: Nullable<string>) => void;
  closeSelectedMovie: () => void;
  toggleFavorite: (mediaId: number) => void;
  setHeaderMode: (mode: HeaderMode) => void;
  setNavigationScrollY: (scrollY: number) => void;
  setSearchOpen: (open: boolean) => void;
  openModal: (modal: UiModalName) => void;
  closeModal: () => void;
  pushToast: (toast: NewToastInput) => string;
  removeToast: (toastId: string) => void;
  setRequestState: (key: string, patch: Partial<RequestEntry>) => void;
  clearRequestState: (key: string) => void;
}
