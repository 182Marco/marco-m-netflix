import { component$ } from "@builder.io/qwik";
import type { MediaItem } from "../../../store/app.types";
import { NavbarRight } from "./navbar-right";
import { Card } from "./card";
import "./home-screen.scss";

export interface HomeScreenProps {
  navLinks: readonly string[];
  searchMovies: MediaItem[];
  searchSeries: MediaItem[];
  popularMovies: MediaItem[];
  popularSeries: MediaItem[];
  favoriteMovies: MediaItem[];
  favoriteSeries: MediaItem[];
}

interface MediaRailProps {
  title: string;
  items: MediaItem[];
  hidden?: boolean;
}

export const HomeScreen = component$((props: HomeScreenProps) => {
  return (
    <div class="appMenu-page">
      <header class="app-header">
        <div class="app-header-inner">
          <nav class="app-nav" aria-label="Main navigation">
            {props.navLinks.map((link, index) => (
              <a href="#" key={`nav_${index}`} class="app-nav-link">
                {link}
              </a>
            ))}
          </nav>
          <NavbarRight />
        </div>
      </header>

      <section class="app-promo" aria-label="Featured content">
        <h2>Featured</h2>
        <p>Promo content is driven by state.movies.promo and can be rendered by a dedicated Promo component.</p>
      </section>

      <MediaRail title="Movies matching your search" items={props.searchMovies} hidden={props.searchMovies.length === 0} />
      <MediaRail title="Series matching your search" items={props.searchSeries} hidden={props.searchSeries.length === 0} />
      <MediaRail title="Popular movies on Netflix" items={props.popularMovies} />
      <MediaRail title="Popular series on Netflix" items={props.popularSeries} />
      <MediaRail title="Your favourite movie list" items={props.favoriteMovies} hidden={props.favoriteMovies.length === 0} />
      <MediaRail title="Your favourite series list" items={props.favoriteSeries} hidden={props.favoriteSeries.length === 0} />
    </div>
  );
});

const MediaRail = component$((props: MediaRailProps) => {
  if (props.hidden) {
    return null;
  }

  return (
    <div>
      <div class="cont">
        <h2>{props.title}</h2>
      </div>
      <div class="cont cards">
        {props.items.map((item) => (
          <Card key={`card_${item.kind}_${item.id}`} obj={item} />
        ))}
      </div>
    </div>
  );
});
