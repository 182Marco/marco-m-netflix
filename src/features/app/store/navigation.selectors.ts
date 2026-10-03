import type { AppState, HeaderMode } from "../../../store/app.types";

export function selectIsSearchOpen(state: AppState): boolean {
  return state.ui.navigation.searchOpen;
}

export function selectHeaderMode(state: AppState): HeaderMode {
  return state.ui.navigation.headerMode;
}