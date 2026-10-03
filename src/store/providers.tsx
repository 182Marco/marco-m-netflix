import { Slot, component$, noSerialize, useContextProvider, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { createAppServices } from "../features/app/services/app-services";
import { AppServicesContext, AppStoreContext } from "./app-context";
import { createAppStore, createInitialAppState, hydrateFromStorage, persistToStorage } from "./app-store";
import type { AppServices } from "../features/app/services/app-services";
import type { AppStore } from "./app.types";

export const AppProviders = component$(() => {
  const reactiveState = useStore(createInitialAppState());
  const appStore: AppStore = createAppStore();
  const appServices = noSerialize(createAppServices()) as AppServices;

  appStore.state = reactiveState;

  useContextProvider(AppStoreContext, noSerialize(appStore) as unknown as AppStore);
  useContextProvider(AppServicesContext, appServices);

  useVisibleTask$(({ track }) => {
    if (!appStore.state.meta.hydrated) {
      const partialState = hydrateFromStorage();
      appStore.hydrate(partialState);
    }

    track(() => JSON.stringify(appStore.state));
    persistToStorage(appStore.state);
  });

  return <Slot />;
});
