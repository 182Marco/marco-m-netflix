export type TmdbMediaType = "movie" | "tv";

export interface TmdbMovieDto {
  id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  original_language: string | null;
}

export interface TmdbTvDto {
  id: number;
  name: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  vote_average: number | null;
  original_language: string | null;
}

export interface TmdbPagedResponseDto<TItem> {
  page: number;
  total_pages: number;
  total_results: number;
  results: TItem[];
}

export interface TmdbVideoDto {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TmdbVideosResponseDto {
  id: number;
  results: TmdbVideoDto[];
}

export type MediaKind = "movie" | "series";

export interface MediaItem {
  id: number;
  kind: MediaKind;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  language: string | null;
  trailerKey: string | null;
}

export interface PagedResult<TItem> {
  page: number;
  totalPages: number;
  totalResults: number;
  items: TItem[];
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function mapMovieCore(dto: TmdbMovieDto): Omit<MediaItem, "kind"> {
  return {
    id: dto.id,
    title: dto.title,
    overview: toNullableString(dto.overview),
    posterPath: toNullableString(dto.poster_path),
    backdropPath: toNullableString(dto.backdrop_path),
    releaseDate: toNullableString(dto.release_date),
    voteAverage: toNullableNumber(dto.vote_average),
    language: toNullableString(dto.original_language),
    trailerKey: null,
  };
}

function mapTvCore(dto: TmdbTvDto): Omit<MediaItem, "kind"> {
  return {
    id: dto.id,
    title: dto.name,
    overview: toNullableString(dto.overview),
    posterPath: toNullableString(dto.poster_path),
    backdropPath: toNullableString(dto.backdrop_path),
    releaseDate: toNullableString(dto.first_air_date),
    voteAverage: toNullableNumber(dto.vote_average),
    language: toNullableString(dto.original_language),
    trailerKey: null,
  };
}

export function mapMovieDtoToDomain(dto: TmdbMovieDto): MediaItem {
  return {
    kind: "movie",
    ...mapMovieCore(dto),
  };
}

export function mapTvDtoToDomain(dto: TmdbTvDto): MediaItem {
  return {
    kind: "series",
    ...mapTvCore(dto),
  };
}

export function mapPagedMoviesDtoToDomain(dto: TmdbPagedResponseDto<TmdbMovieDto>): PagedResult<MediaItem> {
  return {
    page: dto.page,
    totalPages: dto.total_pages,
    totalResults: dto.total_results,
    items: dto.results.map(mapMovieDtoToDomain),
  };
}

export function mapPagedSeriesDtoToDomain(dto: TmdbPagedResponseDto<TmdbTvDto>): PagedResult<MediaItem> {
  return {
    page: dto.page,
    totalPages: dto.total_pages,
    totalResults: dto.total_results,
    items: dto.results.map(mapTvDtoToDomain),
  };
}

function isYouTubeTrailer(video: TmdbVideoDto): boolean {
  return video.site === "YouTube" && video.type === "Trailer";
}

export function pickBestTrailerKey(dto: TmdbVideosResponseDto): string | null {
  const videos = Array.isArray(dto.results) ? dto.results : [];

  const officialTrailer = videos.find((video) => isYouTubeTrailer(video) && video.official);
  if (officialTrailer?.key) {
    return officialTrailer.key;
  }

  const firstTrailer = videos.find(isYouTubeTrailer);
  if (firstTrailer?.key) {
    return firstTrailer.key;
  }

  const firstYouTubeVideo = videos.find((video) => video.site === "YouTube" && Boolean(video.key));
  return firstYouTubeVideo?.key ?? null;
}
