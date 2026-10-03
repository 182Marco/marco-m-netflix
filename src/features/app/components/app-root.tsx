import { component$ } from "@builder.io/qwik";
import { AppProviders } from "../../../store/providers";
import { AppShell } from "./app-shell";

export const AppRoot = component$(() => {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
});
