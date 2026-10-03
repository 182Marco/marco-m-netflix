import type { AppStore } from "../../../store/app.types";

export function setSearchOpenState(store: AppStore, isOpen: boolean): void {
  store.setSearchOpen(isOpen);
}

export function toggleSearchOpenState(store: AppStore): boolean {
  const nextValue = !store.state.ui.navigation.searchOpen;
  store.setSearchOpen(nextValue);
  return nextValue;
}