import type { AppState } from "../../../store/app.types";

export interface NavbarSearchViewModel {
  query: string;
  language: string;
  hasQuery: boolean;
  moviesCount: number;
  seriesCount: number;
  totalResults: number;
  hasResults: boolean;
  isEmptyState: boolean;
}

export function selectSearchQuery(state: AppState): string {
  return state.movies.search.query;
}

export function selectSearchLanguage(state: AppState): string {
  return state.movies.search.language;
}

export function selectNavbarSearchViewModel(state: AppState): NavbarSearchViewModel {
  const query = selectSearchQuery(state).trim();
  const moviesCount = state.movies.lists.searchMovies.length;
  const seriesCount = state.movies.lists.searchSeries.length;
  const totalResults = moviesCount + seriesCount;
  const hasQuery = query.length > 0;

  return {
    query: state.movies.search.query,
    language: selectSearchLanguage(state),
    hasQuery,
    moviesCount,
    seriesCount,
    totalResults,
    hasResults: totalResults > 0,
    isEmptyState: hasQuery && totalResults === 0,
  };
}