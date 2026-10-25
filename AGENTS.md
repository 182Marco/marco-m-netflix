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
  store/store.js          Vuex store: search state, favourites, navbar colour, language
  store/modules/chat.js   namespaced `chat` module (conversation, messages, film list)
  features/auth/api/      tmdbApi.js — ALL axios calls to TMDB live here
  features/chat/          chat client: api, sse, events, state, messages, movies, session
  utils/                  pure helpers (clipLongText, getScrollThreshold)
  data/flags.js           flag data
  scss/                   shared variables, mixins, reset, card-open styles
  assets/img/             images and svg
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
  - **New work (AI chat: `ChatModal`, `ChatModalHeader`, `SettingsDrawer`, `MovieResultsPanel`, `VideoResultTile`, `features/chat`, and future code) uses modern Vue 3 practices** — `emits` declared, `modelValue`/`update:modelValue`, `beforeUnmount`. Prefer these for anything new.
- Keep comments consistent with the surrounding file (existing ones are short, sometimes Italian).
- Guard browser globals with `typeof window/document !== 'undefined'` as existing code does.

## Rules and gotchas

- All HTTP calls go through `src/features/*/api/` (`tmdbApi.js` for TMDB via axios, `chatApi.js` for the bot via `fetch`). Do not call axios/fetch from components or the store directly.
- Store mutation names `pushFavuriteObj` / `removeFavuriteObj` contain a historical typo; do not rename without updating every usage (`Card`).
- Movies vs series are told apart by `obj.title` (movie) vs `obj.name` (series).
- `PromoMovie` hardcodes the featured film (Interstellar, TMDB id `157336`, YouTube key in `script.js`).
- `ChatModal` is lazy-preloaded by `NavbarRight` via `import()` on idle; keep it importable that way.
- `ChatModal` toggles `document.body.style.overflow` through `App`; keep it restored on close/unmount.
- `App/style.scss` has a global `section { padding: 0 5vw }`; new components should not use `<section>` without resetting it.
- `List` hides its title row when no `title` is passed (used by `MovieResultsPanel`).
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
| UI | `ChatModal`, `ChatModalHeader`, `SettingsDrawer`, `MovieResultsPanel`, `VideoResultTile` |

Lifecycle: opening the modal (`App.openAiChat`) dispatches `chat/startNewChat` (new conversation); closing (`App.closeAiChat`) dispatches `chat/endChat` (abort stream, best-effort `DELETE`, clear state). "New chat" does the same as opening. **Session guard:** `state.sessionId` changes on every start/end; every async callback captures it via `sessionGuard` and must ignore stale results. Keep this when adding async code.

Message shape: `{ id, role: 'user' | 'assistant' | 'agent-process', text, timestamp, title?, isOpen?, entries?, attributions? }`. `agent-process` messages hold `entries` (`story` and `step` rows) instead of text; `assistant` messages hold the Markdown answer, filled by `answer_delta`, and `attributions` (JustWatch / YouTube source, must stay visible).

Film window: `movies` (single list, newest first, deduped by `key`) and `moviesPanelVisible` live in the `chat` module. Closing the window only hides it; it reappears when a turn brings new items. `movie`/`tv` items are rendered by `Card` (`compact` prop, 70% size); `video` items by `VideoResultTile`; other types are ignored. Series items already carry `name` instead of `title`.

Tests: there is no test runner. The pure modules and the store were verified with throwaway Node scripts (Node 22, `--experimental-default-type=module`, fake `fetch`), which is why files under `features/chat` and `store/modules/chat.js` import each other with relative paths and explicit `.js` extensions. Keep that.

Settings from `SettingsDrawer` are not sent yet (the contract has no settings field).

## Before finishing a task

1. `npm run lint` passes.
2. `npm run build` passes.
3. Prettier-formatted files you changed.
4. If you added/moved/removed files, update `README.md` and `mappa.html` (the file explanations tab).
