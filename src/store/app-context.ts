import { createContextId, useContext } from "@builder.io/qwik";
import type { AppServices } from "../features/app/services/app-services";
import type { AppStore } from "./app.types";

export const AppStoreContext = createContextId<AppStore>("app.store.context");
export const AppServicesContext = createContextId<AppServices>("app.services.context");

export function useAppStore(): AppStore {
  return useContext(AppStoreContext);
}

export function useAppServices(): AppServices {
  return useContext(AppServicesContext);
}
