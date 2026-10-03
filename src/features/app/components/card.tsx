import { $, component$, useSignal } from "@builder.io/qwik";
import type { MediaItem } from "../../../store/app.types";
import { useAppServices, useAppStore } from "../../../store/app-context";
import { VideoComp } from "./video-comp";
import "./card.scss";

export interface CardProps {
  obj: MediaItem;
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";
const DEFAULT_FLAGS = ["en", "it"] as const;
const FAVORITES_DEFAULT_PROFILE = "default";

const countWords = (str: string): number => str.trim().split(/\s+/).length;
const hasMoreThanWords = (str: string, n?: number): boolean => countWords(str) > (n || 60);
const getFirstWords = (str: string, n?: number): string =>
  str
    .split(/\s+/)
    .slice(0, n || 60)
    .join(" ");
const getRemainingText = (str: string, n?: number): string =>
  str
    .split(/\s+/)
    .slice(n || 60)
    .join(" ");
const findCutIndex = (str: string): number => str.search(/[.,]/);

function clipLongText(str: string, n?: number): string {
  if (!hasMoreThanWords(str, n)) {
    return str;
  }

  const firstPart = getFirstWords(str, n);
  const remainingText = getRemainingText(str, n);
  const cutIndex = findCutIndex(remainingText);

  if (cutIndex !== -1) {
    return `${firstPart}${remainingText.substring(0, cutIndex + 1)}...`;
  }

  return `${firstPart} ...`;
}

export const Card = component$((props: CardProps) => {
  const appStore = useAppStore();
  const services = useAppServices();
  const trailerKey = useSignal("");
  const open = useSignal(false);
  const showVideo = useSignal(false);

  const isFavorite = () => {
    const ids = appStore.state.favorites.idsByUser[FAVORITES_DEFAULT_PROFILE] ?? [];
    return ids.includes(props.obj.id);
  };

  const getTrailerData$ = $(async () => {
    const language = props.obj.kind === "movie" ? "it-IT" : "en-US";

    const key = await services.moviesApi
      .getTrailerKey({
        id: props.obj.id,
        kind: props.obj.kind,
        language,
      })
      .catch(() => null);

    trailerKey.value = key ?? "";
  });

  const onPlay$ = $(async () => {
    await getTrailerData$();
    showVideo.value = !showVideo.value;
  });

  const onToggleFavorite$ = $(() => {
    appStore.toggleFavorite(props.obj.id);
  });

  const posterUrl = props.obj.posterPath ? `${TMDB_IMAGE_BASE_URL}${props.obj.posterPath}` : "/src/assets/img/bigBrand.webp";
  const title = props.obj.title;
  const language = props.obj.language;
  const filledStars = Math.ceil((props.obj.voteAverage ?? 0) / 2);
  const remainingStars = 5 - filledStars;

  return (
    <div class={["bg-in-preview", open.value ? "active" : ""]}>
      <i class={["close", "x", "fas", "fa-times", open.value ? "active" : ""]} onClick$={() => (open.value = false)} />

      <div class={["wrap-texts-in-prev", open.value ? "active" : ""]}>
        <h1 class="name-in-preview">{title}</h1>

        <div class={["stars", open.value ? "active" : ""]}>
          {Array.from({ length: filledStars }).map((_, index) => (
            <i key={`star_full_${props.obj.id}_${index}`} class="fas fa-star" />
          ))}
          {Array.from({ length: remainingStars }).map((_, index) => (
            <i key={`star_empty_${props.obj.id}_${index}`} class="far fa-star" />
          ))}
        </div>

        <p class="overview">{clipLongText(props.obj.overview ?? "")}</p>
        <p class="releaseDate">release date: {props.obj.releaseDate ?? ""}</p>

        <div class={["original-lang", open.value ? "active" : ""]}>
          <span>Original lenguage:</span>
          {language && DEFAULT_FLAGS.includes(language as (typeof DEFAULT_FLAGS)[number]) ? (
            <img class="flag" src={`/src/assets/img/${language}.png`} alt={`${language} flag`} />
          ) : (
            <span>{language ?? ""}</span>
          )}
        </div>

        <button class="btn play" onClick$={onPlay$}>
          <i class="fas fa-play" />
        </button>

        {!isFavorite() ? (
          <h3 class="add-to-favourites" onClick$={onToggleFavorite$}>
            <i class="fas fa-plus" /> Add to favourites list
          </h3>
        ) : (
          <h3 class="remove add-to-favourites" onClick$={onToggleFavorite$}>
            <i class="fas fa-minus" /> Remove from favourites list
          </h3>
        )}

        {showVideo.value ? <VideoComp keyFromApi={trailerKey.value} obj={props.obj} onClose$={() => (showVideo.value = false)} /> : null}
      </div>

      <a
        class={["card", open.value ? "active" : ""]}
        href="#"
        onClick$={(event) => {
          event.preventDefault();
          open.value = true;
        }}
      >
        <div class={["poster", open.value ? "active" : ""]}>
          <div class={["img-wrap", open.value ? "active" : ""]}>
            <div class={["img-big", !props.obj.posterPath ? "place holder" : "", open.value ? "active" : ""]} style={{ backgroundImage: `url(${posterUrl})` }} />
            <img class={[open.value ? "active" : ""]} src={posterUrl} alt={`${title} sign poster`} />
          </div>
          <p class={["name", open.value ? "active" : ""]}>{clipLongText(title, 2)}</p>
        </div>
      </a>
    </div>
  );
});
