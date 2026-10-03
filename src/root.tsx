import { component$ } from "@builder.io/qwik";
import { AppRoot } from "./features/app/components/app-root";
import "@fontsource/montserrat/index.css";
import "@fontsource/montserrat/700.css";
import "./scss/reset.scss";

export default component$(() => {
  return <AppRoot />;
});
