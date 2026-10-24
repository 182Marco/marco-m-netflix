# AGENTS.md

Guidance for AI coding agents working in this repository. Read it before changing code. For a visual overview open `mappa.html` in a browser.

## What this project is

A front-end-only Netflix clone (Vue 3 + Vuex 4, Vue CLI) that reads data from the public TMDB REST API. It also contains an **AI chat assistant ("Netflix Scout")**. Today the chat is a **UI prototype with mocked replies**; the plan is to connect it to a backend bot over HTTP (see "AI chat" below).

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

Never commit `.env` or real keys. Variables must start with `VUE_APP_` to reach the browser (Vue CLI rule). A future bot backend URL should follow the same convention (e.g. `VUE_APP_CHAT_API_URL`).

## Architecture

```
src/
  main.js                 createApp + Vuex plugin + mount
  App/                    root component (loads popular lists, owns chat open/close)
  components/<Name>/      one folder per component (see convention below)
  store/store.js          Vuex store: search state, favourites, navbar colour, language
  features/auth/api/      tmdbApi.js — ALL axios calls to TMDB live here
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
  - **New work (AI chat: `ChatModal`, `ChatModalHeader`, `SettingsDrawer`, and future code) uses modern Vue 3 practices** — `emits` declared, `modelValue`/`update:modelValue`, `beforeUnmount`. Prefer these for anything new.
- Keep comments consistent with the surrounding file (existing ones are short, sometimes Italian).
- Guard browser globals with `typeof window/document !== 'undefined'` as existing code does.

## Rules and gotchas

- All HTTP calls go through `src/features/auth/api/`. Do not call axios from components or the store directly.
- Store mutation names `pushFavuriteObj` / `removeFavuriteObj` contain a historical typo; do not rename without updating every usage (`Card`).
- Movies vs series are told apart by `obj.title` (movie) vs `obj.name` (series).
- `PromoMovie` hardcodes the featured film (Interstellar, TMDB id `157336`, YouTube key in `script.js`).
- `ChatModal` is lazy-preloaded by `NavbarRight` via `import()` on idle; keep it importable that way.
- `ChatModal` toggles `document.body.style.overflow` through `App`; keep it restored on close/unmount.
- `dist/` is committed build output and `deploy.sh` publishes it; don't hand-edit it. `main` (empty file) at the repo root is a stray artifact.
- `netlify.toml` still says Node 16 while the project requires Node 22; fix it if you touch deployment.

## AI chat

Files: `components/ChatModal` (state, messages, scrolling), `ChatModalHeader` (settings / new chat / close), `SettingsDrawer` (slide-in panel with a `<slot>`; Default/Apply buttons).

Message shape: `{ id, role: 'user' | 'assistant' | 'agent-process', text, timestamp, title?, isOpen? }`. `agent-process` messages render as a collapsible accordion showing the bot's reasoning steps.

Current behaviour: `sendMessage()` pushes the user message, a fake `agent-process` (static text), and a fixed assistant reply.

Planned integration (when wiring the backend bot):

1. Add a `chat` function in `src/features/.../chatApi.js` (not inside the component).
2. `sendMessage()` pushes the user message, then an empty `agent-process` message and an empty `assistant` message.
3. Stream the response (SSE/fetch stream): process chunks go to `appendToLatestProcess(chunk)` (already exists), answer tokens are appended to the assistant message.
4. Handle errors and loading state in the UI; never expose secrets in the browser — the bot backend holds LLM and DB credentials.
5. Settings from `SettingsDrawer` should be sent with each request.

See the "Flusso" tab in `mappa.html` for the diagram.

## Before finishing a task

1. `npm run lint` passes.
2. `npm run build` passes.
3. Prettier-formatted files you changed.
4. If you added/moved/removed files, update `README.md` and `mappa.html` (the file explanations tab).
