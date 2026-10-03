import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { useAppServices, useAppStore } from "../../../store/app-context";
import { HomeScreen } from "./home-screen";
import { getScrollThresholdNav } from "../services/navigation.helper";
import { applyScrollHeaderMode, bootstrapHomeData } from "../store/app-actions";
import { selectHomeScreenModel } from "../store/app-selectors";

export const AppShell = component$(() => {
  const appStore = useAppStore();
  const appServices = useAppServices();
  const bootstrapDone = useSignal(false);

  useVisibleTask$(({ cleanup }) => {
    if (bootstrapDone.value) {
      return;
    }

    bootstrapDone.value = true;
    const controller = new AbortController();

    const onScroll = () => {
      const threshold = getScrollThresholdNav(window.innerWidth);
      applyScrollHeaderMode(appStore, window.scrollY, threshold);
    };

    void (async () => {
      await bootstrapHomeData(appStore, appServices, controller.signal).catch(() => undefined);
      onScroll();
    })();

    window.addEventListener("scroll", onScroll);

    cleanup(() => {
      controller.abort();
      window.removeEventListener("scroll", onScroll);
    });
  });

  const model = selectHomeScreenModel(appStore.state);

  return (
    <div id="app">
      <HomeScreen
        navLinks={model.navLinks}
        searchMovies={model.searchMovies}
        searchSeries={model.searchSeries}
        popularMovies={model.popularMovies}
        popularSeries={model.popularSeries}
        favoriteMovies={model.favoriteMovies}
        favoriteSeries={model.favoriteSeries}
      />
    </div>
  );
});
