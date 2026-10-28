# AGENTS.md

Guidance for AI coding agents working in this repository. Read it before changing code. For a visual overview open `mappa.html` in a browser.

## What this project is

A front-end-only Netflix clone (Vue 3 + Vuex 4, Vue CLI) that reads data from the public TMDB REST API. It also contains an **AI chat assistant ("Netflix Scout")**. The chat streams answers from the NetflixScout backend over HTTP/SSE (see "AI chat" below).

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies (Node 22, see `.nvmrc`) |
| `npm run serve` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run lint` | ESLint on `src` |
| `npm run format` / `format:check` | Prettier write / check |

There is no test suite. Verify changes with `npm run lint` and `npm run build`, and by running the app when UI is touched.

Before running any npm script, check `node -v` is 22 (the shell may default to 16; nvm has v22 under `~/.nvm/versions/node`). `npm run lint` and `npm run build` fail on older Node, and a failed or even successful `npm run build` rewrites the committed `dist/`: afterwards restore it with `git checkout -- dist && git clean -fdq dist` unless the task is a deploy.

## Environment

Copy `.env.example` to `.env` and fill in:

- `VUE_APP_TMDB_API_KEY` — TMDB API key
- `VUE_APP_TMDB_BASE_URL` — defaults to `https://api.themoviedb.org/3`
- `VUE_APP_CHAT_API_URL` — NetflixScout backend, defaults to `http://localhost:8000` (run it with a single worker; CORS allows `localhost:8080`)

Never commit `.env` or real keys. Variables must start with `VUE_APP_` to reach the browser (Vue CLI rule). The bot backend URL is `VUE_APP_CHAT_API_URL` (defaults to `http://localhost:8000`).

## Architecture

```
src/
  main.js                 createApp + Vuex plugin + mount
  App/                    root component (loads popular lists, owns chat open/close)
  components/<Name>/      one folder per component (see convention below)
  store/store.js          Vuex store: search state, favourites, navbar colour, language (short code), getters `t` / `tmdbLanguage`
  store/modules/chat.js   namespaced `chat` module (conversation, messages, film list)
  features/auth/api/      tmdbApi.js — ALL axios calls to TMDB live here
  features/chat/          chat client: api, sse, events, state, messages, movies, session
  utils/                  pure helpers (clipLongText, getScrollThreshold, translate)
  data/flags.js           SVG flag per language code
  scss/                   shared variables, mixins, reset, card-open styles
  assets/img/             images and svg
```
locales/texts.js          OUTSIDE src: every UI text by category and language + LANGUAGES list (alias `@locales`)
```

Data flow: `App` fetches popular movies/series on mount; typing in the search box (`NavbarRight`) commits `setQuery` and dispatches `getAllData`, which calls TMDB and fills `movies`/`series` in the store; `App` renders them through `List` + `Card`.

## Component convention (important)

Every component is a folder with four files wired by `index.vue`:

```
index.vue      <template src="./template.html"> + <script src="./script.js"> + <style scoped lang="scss" src="./style.scss">
template.html markup only
script.js      logic only
style.scss     scoped styles
```

When adding a component, copy this structure. Import it as `@/components/Name` (the alias resolves to `src/`).

## Code style

- Prettier: 2 spaces, single quotes, semicolons, trailing commas, 80 cols (`.prettierrc`). Run `npm run format` on files you touch.
- **Two generations of code coexist on purpose:**
  - Original components (`Card`, `List`, `HeaderComp`, `NavbarLeft`, `NavbarRight`, `PromoMovie`, `VideoComp`, store) use **Options API** and a Vue 2 style, kept intentionally as a record of the author's progress. Do **not** refactor them for modernisation alone.
  - **New work (`NotificationMenu`, AI chat: `ChatModal`, `ChatModalHeader`, `SettingsDrawer`, `SettingsForm`, `MovieResultsPanel`, `VideoResultTile`, `features/chat`, and future code) uses modern Vue 3 practices** — `emits` declared, `modelValue`/`update:modelValue`, `beforeUnmount`. Prefer these for anything new.
- Keep comments consistent with the surrounding file (existing ones are short, sometimes Italian).
- Guard browser globals with `typeof window/document !== 'undefined'` as existing code does.

## Rules and gotchas

- **No hardcoded visible text.** Every string shown to the user (buttons, titles, placeholders, `alt`, `aria-label`, chat errors) lives in `locales/texts.js` as `TEXTS.category.key = { en, it, es, de, fr }` and is read with `$t('category.key')` (global property from `main.js`, reactive to language changes). Add a new language by adding it to `LANGUAGES` and to every text (missing keys fall back to `en`). Codes are ISO 639-1 (`es`, `fr`, not `sp`/`fe`). Do not translate backend content (assistant text, steps, attributions, video titles); settings labels already use `localize`.
- **Language** is `state.language` (short code, persisted in `localStorage`, also sets `<html lang>`). `getters.tmdbLanguage` gives the TMDB tag (`en-US`, `it-IT`, …); every call in `tmdbApi.js` must receive it (`getPopularTrends`, `searchMovies/Series`, `getTrailerVideos`, which falls back to `en-US` when a trailer does not exist in that language). `App` refetches popular lists and the current search when it changes; favourites keep the language they were saved in. The chat backend does not receive the UI language.
- Chat failures carry `messageKey` (a `errors.*` key), not text: it is translated at render time (`ChatModal`). The same goes for the `agent-process` title (`titleKey`).

- All HTTP calls go through `src/features/*/api/` (`tmdbApi.js` for TMDB via axios, `chatApi.js` for the bot via `fetch`). Do not call axios/fetch from components or the store directly.
- Store mutation names `pushFavuriteObj` / `removeFavuriteObj` contain a historical typo; do not rename without updating every usage (`Card`).
- Movies vs series are told apart by `obj.title` (movie) vs `obj.name` (series).
- `PromoMovie` hardcodes the featured film (Interstellar, TMDB id `157336`, YouTube key in `script.js`).
- `ChatModal` is lazy-preloaded by `NavbarRight` via `import()` on idle; keep it importable that way.
- `ChatModal` toggles `document.body.style.overflow` through `App`; keep it restored on close/unmount.
- `App/style.scss` has a global `section { padding: 0 5vw }`; new components should not use `<section>` without resetting it.
- `List` hides its title row when no `title` is passed (used by `MovieResultsPanel`).
- Navbar links: `App.linksNavLf` is `[{ key, label }]`; `NavbarLeft` emits `select` with the `key` and `App.onNavSelect` scrolls (Home -> top, TV Series -> `popularSeries` title, Movies/New & Popular -> `popularMovies` title, both 15px under the fixed header; My List -> `myList` block with a `myListPulse` glow). `HeaderComp` emits `go-home` on logo click. A new link needs its `nav.*` text and a case in `onNavSelect`.
- "My List": while both favourites lists are empty, `App` shows one `List` with the `.fav-empty` placeholder (`list.favEmpty` / `list.favEmptyHint`) instead of the two favourites lists.
- `NotificationMenu` (gift and bell in `NavbarRight`): props `icon`, `label`, `open`, `badge`; emits `toggle`, `select`, `close`. `NavbarRight` owns `openMenu` (one open at a time) and `bellSeen` (hides the "1" badge); `select` opens the search like the magnifier. The text comes from `navbar.botNotification`; the profile photo has no arrow any more.
- `CloseXButton` is used only by `VideoComp` (the old `header-modal-close` variant has no users, `MovieResultsPanel` no longer uses it). Its base size must not change: the trailer's big round close button (64px, top right) is applied from `VideoComp/style.scss` with `:deep()`. `MovieResultsPanel` is now an accordion: the toggle header (title, count, chevron) emits `open` / `close`.
- `dist/` is committed build output and `deploy.sh` publishes it; don't hand-edit it. `main` (empty file) at the repo root is a stray artifact.
- `netlify.toml` still says Node 16 while the project requires Node 22; fix it if you touch deployment.

## AI chat

The chat talks to the NetflixScout backend (`web_api`, FastAPI + SSE). Contract: `NetflixScout/web_api/FRONTEND_API.md` in the backend repo — do not invent events or fields that are not documented there. The backend holds all LLM/DB keys; the browser never sends any.

Layers (each in its own file, mostly pure functions):

| Concern | File |
| --- | --- |
| HTTP (`fetch`; axios cannot stream) | `features/chat/api/chatApi.js` |
| SSE parsing (incremental, pure) | `features/chat/sse/parseSse.js` |
| Event -> intent (pure) | `features/chat/events/eventToIntent.js`, `failure.js` |
| State transitions (pure reducers) | `features/chat/state/turnReducer.js` |
| Messages, reasoning rows, Markdown | `features/chat/messages/{messages,render,markdown}.js` |
| Film list (flatten, dedupe, Card adapter) | `features/chat/movies/mergeMovies.js` |
| Reconciliation after a disconnect | `features/chat/session/reconcile.js` |
| Vuex module `chat` (thin actions) | `store/modules/chat.js` |
| Settings (normalize, defaults, preferences) | `features/chat/settings/settings.js`, `store/modules/chatSettings.js` |
| UI | `ChatModal`, `ChatModalHeader`, `SettingsDrawer`, `SettingsForm`, `MovieResultsPanel`, `VideoResultTile` |

Lifecycle: opening the modal (`App.openAiChat`) dispatches `chat/startNewChat` (new conversation); closing (`App.closeAiChat`) dispatches `chat/endChat` (abort stream, best-effort `DELETE`, clear state). "New chat" does the same as opening. **Session guard:** `state.sessionId` changes on every start/end; every async callback captures it via `sessionGuard` and must ignore stale results. Keep this when adding async code.

Message shape: `{ id, role: 'user' | 'assistant' | 'agent-process', text, timestamp, titleKey?, isOpen?, entries?, attributions? }`. `agent-process` messages hold `entries` (`story` and `step` rows) instead of text; `assistant` messages hold the Markdown answer, filled by `answer_delta`, and `attributions` (JustWatch / YouTube / Wikipedia source, must stay visible). A `step` entry's `lines` start, for every tool step with HTTP (`tmdb_calls`, `youtube_calls`, `wikipedia_calls`, `omdb_calls`), with one line per call `METHOD URL` (`callLines` in `render.js`): the URL is the one the backend really called, parameters included, with only the key value already masked as `***` by the backend: show it as received, never rebuild or shorten it. A `step` entry also has `links` (`[{label, url}]`, https only, rendered as `<a target="_blank" rel="noopener noreferrer">`): today only `wikipedia_calls` fills it (the pages read and the CC BY-SA licence, as the backend sends them).

Film window: `movies` (single list, newest first, deduped by `key`) and `moviesPanelVisible` live in the `chat` module. Closing the window only hides it; it reappears when a turn brings new items. `movie`/`tv` items are rendered by `Card` (`compact` prop, 70% size); `video` items by `VideoResultTile`; other types are ignored. Series items already carry `name` instead of `title`.

Tests: there is no test runner. The pure modules and the store were verified with throwaway Node scripts (Node 22, `--experimental-default-type=module`, fake `fetch`), which is why files under `features/chat` and `store/modules/chat.js` import each other with relative paths and explicit `.js` extensions. Keep that.

Settings: `GET /settings` is the only source of fields, options, labels and defaults (`NetflixScout/web_api/contracts/settings.md`). `App.openAiChat` dispatches `chatSettings/load` (once per chat entry; repeated calls are no-ops), `closeAiChat` commits `chatSettings/reset`. The `chatSettings` module is separate from `chat` on purpose: `chat/resetChat` wipes the whole `chat` state. Pure helpers live in `features/chat/settings/settings.js`; the form is `SettingsForm` (inside the `SettingsDrawer` slot). `chat/send` passes `chatSettings/preferences` to `streamMessage` on every turn (`null` when the config is missing: the field is omitted) and realigns only `ignored_preferences` from `turn_start`. "New chat" restores the defaults without refetching. Never hardcode options, labels or defaults. The backend sends every label (fields and options) in all five languages (`en`, `it`, `es`, `de`, `fr`) and the frontend picks one with `localize(label, lang)` (language label, else `en`), so changing language updates the form without refetching `/settings`. There is no frontend translation overlay: add or fix a translation in the backend `preferences/fields.json`. A new field or option from the backend needs no frontend change. Ids, `value`s and defaults still come from the backend and `preferences` is sent exactly as before.

## Before finishing a task

1. `npm run lint` passes (it covers `src` and `locales`; use Node 22).
2. `npm run build` passes.
3. Prettier-formatted files you changed.
4. If you added/moved/removed files, update `README.md` and `mappa.html` (the file explanations tab).
