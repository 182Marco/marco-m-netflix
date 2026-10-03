import { createTmdbMoviesApi, type MoviesApi } from "../../movies/api/movies.api";

export interface AppServices {
  moviesApi: MoviesApi;
}

function resolveEnv(name: string): string | undefined {
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
  return meta.env?.[name];
}

function resolveTmdbApiKey(): string {
  return (
    resolveEnv("PUBLIC_TMDB_API_KEY") ??
    resolveEnv("TMDB_API_KEY") ??
    ""
  );
}

export function createAppServices(): AppServices {
  return {
    moviesApi: createTmdbMoviesApi({
      apiKey: resolveTmdbApiKey(),
      defaultLanguage: "en-US",
    }),
  };
}
