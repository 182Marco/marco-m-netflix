import type { AppState, MediaItem } from "../../../store/app.types";

export interface HomeScreenViewModel {
  navLinks: string[];
  searchMovies: MediaItem[];
  searchSeries: MediaItem[];
  popularMovies: MediaItem[];
  popularSeries: MediaItem[];
  favoriteMovies: MediaItem[];
  favoriteSeries: MediaItem[];
}

export const HOME_NAV_LINKS: readonly string[] = [
  "Home",
  "TV Series",
  "Movies",
  "New & Popular",
  "My List",
];

const FAVORITES_DEFAULT_PROFILE = "default";

export function selectFavoriteItems(state: AppState): { movies: MediaItem[]; series: MediaItem[] } {
  const ids = state.favorites.idsByUser[FAVORITES_DEFAULT_PROFILE] ?? [];

  const items = ids
    .map((id) => state.movies.lists.byId[String(id)])
    .filter((item): item is MediaItem => item !== undefined);

  return {
    movies: items.filter((item) => item.kind === "movie"),
    series: items.filter((item) => item.kind === "series"),
  };
}

export function selectHomeScreenModel(state: AppState): HomeScreenViewModel {
  const favorites = selectFavoriteItems(state);

  return {
    navLinks: [...HOME_NAV_LINKS],
    searchMovies: state.movies.lists.searchMovies,
    searchSeries: state.movies.lists.searchSeries,
    popularMovies: state.movies.lists.popularMovies,
    popularSeries: state.movies.lists.popularSeries,
    favoriteMovies: favorites.movies,
    favoriteSeries: favorites.series,
  };
}
