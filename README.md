# Netflix Reproduction Project

A front-end reproduction of the Netflix interface and some of its main functionalities, developed as a learning project and subsequently migrated from **Vue 2 to Vue 3**.

The project reproduces the main browsing experience of a streaming platform, including authentication simulation, movie and TV show discovery, search, details pages, favourites, ratings and trailers.

## Features

The main screen provides:

* Search bar
* Featured title with an **Interstellar** background
* List of popular movies
* List of popular TV shows
* Movie and TV show browsing
* Search by title
* Detailed content pages
* Favourites management
* Star ratings
* Trailer playback

Users can select movies or TV shows by clicking on their posters. The search bar allows users to search for titles by entering a sequence of letters.

Search and content data are retrieved through requests to a public REST API. The backend service, including its database and data processing, is external to the project and is not under the application's control.

From a title's detail page, users can view information such as the cover image and plot synopsis. The original intention was to provide access to the content itself, but for copyright reasons this functionality has been replaced with trailer playback.

## Technical Overview

This is a **front-end-only application**.

The application communicates with a public REST API to retrieve movie and TV show data. There is no custom backend, database or server-side data processing implemented in this repository.

The application state is managed through **Vuex**.

## Technologies

* **Vue 3.5.43** — front-end framework
* **Vuex 4.1.0** — centralized state management
* **JavaScript** — application logic
* **HTML** — markup
* **SCSS / CSS** — styling
* **Axios** — HTTP requests
* **Vue CLI** — development and build tooling
* **ESLint** — code linting

## Vue 3 Migration

The project was originally developed with **Vue 2** and has since been migrated to **Vue 3**.

The migration includes:

* Vue 2 → Vue 3
* Vuex 2 → Vuex 4
* `new Vue()` → `createApp()`
* Vue 2 application mounting → Vue 3 `app.mount()`
* `Vue.use(Vuex)` → Vue 3 application plugin registration
* `beforeDestroy` → `beforeUnmount`
* Vue 2 custom `v-model` API → Vue 3 `modelValue` / `update:modelValue`
* Vue 2 compiler → `@vue/compiler-sfc`
* Vue 2-specific APIs removed from the codebase
* Browser `window` / `document` usage aligned with the Vue 3 application lifecycle
* ESLint configured for browser globals

The original components intentionally retain the Vue2 syntax and coding style from when I first created them during my early developer training. ❤️

I decided to preserve them as a historical record of my development journey, allowing me to look back and clearly see how my skills and coding style have evolved over time. It also avoids introducing unnecessary risks by refactoring stable, working components purely for the sake of modernization.

The new AI features I am currently developing, however, will be implemented using the newer Vue3 syntax and development practices.


## Node.js

The project uses **Node.js 22 LTS**.

The repository contains an `.nvmrc` file specifying:

```text
22
```

If you use **nvm**, you can activate the project's Node version with:

```bash
nvm use
```

If Node 22 is not installed yet:

```bash
nvm install 22
nvm use 22
```

The project previously used Node 16, but this is no longer supported by the current development environment and caused issues with the old `--openssl-legacy-provider` configuration.

The legacy OpenSSL flag has been removed from the project scripts.

## Project Setup

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run serve
```

The application will be available on the local development server.

### Production Build

Compile and minify the application for production:

```bash
npm run build
```

### Lint

Run ESLint on the application source code:

```bash
npm run lint
```

## Project Structure

The application follows a component-based Vue architecture.

The main areas of the project include:

* `src/components/` — reusable Vue components
* `src/views/` — application views and larger UI sections
* `src/store/` — Vuex state management
* `src/assets/` — static assets
* `src/scss/` — global SCSS styles and variables
* `src/App/` — root application logic and styling
* `src/main.js` — Vue application bootstrap

The exact organization reflects the original structure of the project and has been preserved where possible during the Vue 3 migration.

## Development Notes

This project was originally created during an earlier stage of my development journey. It should therefore be considered both a functional application and a record of my progression as a developer.

The original implementation predates my current approach to development and does not necessarily represent how I would structure a new application today.

In particular, the project was originally developed with Vue 2 and JavaScript. The subsequent migration to Vue 3 modernized the framework and build environment while intentionally preserving most of the original architecture and behaviour.

A new project developed today would likely use a more modern architecture, stronger typing with TypeScript, and a more modular approach to reusable components and application logic.

## Configuration

The project uses Vue CLI for its development and build configuration.

For additional Vue CLI configuration information, see the [Vue CLI documentation](https://cli.vuejs.org/config/).

## License

This project is a personal learning and reproduction project inspired by the Netflix user interface. Netflix and its associated trademarks, logos and content belong to their respective owners.
