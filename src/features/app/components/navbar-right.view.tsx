import { component$, type PropFunction } from "@builder.io/qwik";

export interface NavbarRightViewProps {
  isSearchOpen: boolean;
  query: string;
  language: string;
  isSearching: boolean;
  searchError: string | null;
  hasQuery: boolean;
  hasResults: boolean;
  isEmptyState: boolean;
  moviesCount: number;
  seriesCount: number;
  onToggleSearch$: PropFunction<() => void>;
  onQueryInput$: PropFunction<(value: string) => void>;
  onLanguageChange$: PropFunction<(value: string) => void>;
  onClearSearch$: PropFunction<() => void>;
}

export const NavbarRightView = component$((props: NavbarRightViewProps) => {
  return (
    <nav aria-label="Secondary navigation" class="navbar-right">
      <ul>
        <li class="search-item">
          <button type="button" class="icon-button" aria-expanded={props.isSearchOpen} aria-label="Toggle search" onClick$={props.onToggleSearch$}>
            <i class="fas fa-search" />
          </button>

          {props.isSearchOpen && (
            <div class="input-wrap">
              <input
                type="text"
                value={props.query}
                autoFocus
                placeholder="Search movies or series"
                aria-label="Search query"
                onInput$={(event) => {
                  const nextValue = (event.target as HTMLInputElement).value;
                  props.onQueryInput$(nextValue);
                }}
              />
              <select
                value={props.language}
                aria-label="Search language"
                onChange$={(event) => {
                  const nextLanguage = (event.target as HTMLSelectElement).value;
                  props.onLanguageChange$(nextLanguage);
                }}
              >
                <option value="it-IT">it</option>
                <option value="en-US">en</option>
              </select>
              <button type="button" class="clear-button" onClick$={props.onClearSearch$} disabled={!props.hasQuery}>
                Clear
              </button>
            </div>
          )}
        </li>

        <li class="search-meta" aria-live="polite">
          {props.isSearching && <span>Searching...</span>}
          {!props.isSearching && props.searchError && <span>Search failed: {props.searchError}</span>}
          {!props.isSearching && !props.searchError && props.hasResults && (
            <span>
              {props.moviesCount} movies, {props.seriesCount} series
            </span>
          )}
          {!props.isSearching && !props.searchError && props.isEmptyState && <span>No results</span>}
        </li>

        <li class="tablet">
          <a href="#" aria-label="Gift">
            <i class="fas fa-gift" />
          </a>
        </li>
        <li class="tablet">
          <a href="#" aria-label="Notifications">
            <i class="fas fa-bell" />
          </a>
        </li>
        <li class="tablet">
          <a href="#" class="withArrow" aria-label="Account menu">
            <img src="/src/assets/img/marcoMilza.webp" alt="App author" />
            <span class="arrow" />
          </a>
        </li>
      </ul>
    </nav>
  );
});