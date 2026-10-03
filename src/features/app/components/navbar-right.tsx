import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useAppServices, useAppStore } from "../../../store/app-context";
import { NavbarRightView } from "./navbar-right.view";
import { setSearchOpenState, toggleSearchOpenState } from "../store/navigation.actions";
import { selectIsSearchOpen } from "../store/navigation.selectors";
import { clearSearchedLists, MOVIES_SEARCH_REQUEST_KEY, searchMoviesAndSeries } from "../store/movies.actions";
import { selectNavbarSearchViewModel } from "../store/movies.selectors";
import { selectIsRequestLoadingByKey, selectRequestErrorByKey } from "../store/requests.selectors";

export interface NavbarRightProps {
  debounceMs?: number;
}

export const NavbarRight = component$((props: NavbarRightProps) => {
  const appStore = useAppStore();
  const services = useAppServices();
  const debounceTimerId = useSignal<number | null>(null);

  const clearPendingTimer = $(() => {
    if (debounceTimerId.value !== null) {
      window.clearTimeout(debounceTimerId.value);
      debounceTimerId.value = null;
    }
  });

  const runSearchNow = $(() => {
    void searchMoviesAndSeries(appStore, services).catch(() => undefined);
  });

  const scheduleSearch = $((delayMs: number) => {
    clearPendingTimer();
    debounceTimerId.value = window.setTimeout(() => {
      debounceTimerId.value = null;
      runSearchNow();
    }, delayMs);
  });

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      clearPendingTimer();
    });
  });

  const onToggleSearch$ = $(() => {
    const opened = toggleSearchOpenState(appStore);

    if (!opened) {
      clearPendingTimer();
    }
  });

  const onQueryInput$ = $((value: string) => {
    appStore.setSearchQuery(value);

    if (value.trim().length === 0) {
      clearPendingTimer();
      clearSearchedLists(appStore);
      return;
    }

    if (!selectIsSearchOpen(appStore.state)) {
      setSearchOpenState(appStore, true);
    }

    scheduleSearch(props.debounceMs ?? 300);
  });

  const onLanguageChange$ = $((value: string) => {
    appStore.setSearchLanguage(value);

    if (appStore.state.movies.search.query.trim().length === 0) {
      return;
    }

    runSearchNow();
  });

  const onClearSearch$ = $(() => {
    clearPendingTimer();
    appStore.setSearchQuery("");
    clearSearchedLists(appStore);
  });

  const searchModel = selectNavbarSearchViewModel(appStore.state);
  const isSearchOpen = selectIsSearchOpen(appStore.state);
  const isSearching = selectIsRequestLoadingByKey(appStore.state, MOVIES_SEARCH_REQUEST_KEY);
  const searchError = selectRequestErrorByKey(appStore.state, MOVIES_SEARCH_REQUEST_KEY);

  return (
    <NavbarRightView
      isSearchOpen={isSearchOpen}
      query={searchModel.query}
      language={searchModel.language}
      isSearching={isSearching}
      searchError={searchError}
      hasQuery={searchModel.hasQuery}
      hasResults={searchModel.hasResults}
      isEmptyState={searchModel.isEmptyState}
      moviesCount={searchModel.moviesCount}
      seriesCount={searchModel.seriesCount}
      onToggleSearch$={onToggleSearch$}
      onQueryInput$={onQueryInput$}
      onLanguageChange$={onLanguageChange$}
      onClearSearch$={onClearSearch$}
    />
  );
});