import {
  getTrending,
  getPopularTrends,
  discoverByGenre,
} from '../auth/api/tmdbApi.js';

// card massime per riga (come Netflix: righe corte, niente centinaia di nodi)
export const MAX_ITEMS = 20;

const genre = (movieGenres, tvGenres) => (language) =>
  [
    {
      type: 'movie',
      request: discoverByGenre({
        type: 'movie',
        genres: movieGenres,
        language,
      }),
    },
    {
      type: 'tv',
      request: discoverByGenre({ type: 'tv', genres: tvGenres, language }),
    },
  ];

// key = chiave nello store + anchor id (`home-<key>`) + testo `home.sections.<key>`
// eager: caricata subito; le altre solo quando la riga entra nel viewport
export const HOME_SECTIONS = [
  {
    key: 'trending',
    eager: true,
    fetchers: (language) => [
      { type: 'movie', request: getTrending('movie', language) },
      { type: 'tv', request: getTrending('tv', language) },
    ],
  },
  {
    key: 'popular',
    eager: true,
    fetchers: (language) => [
      { type: 'movie', request: getPopularTrends('movie', language) },
      { type: 'tv', request: getPopularTrends('tv', language) },
    ],
  },
  // film 28 Action | 12 Adventure; serie 10759 Action & Adventure
  { key: 'actionAdventure', fetchers: genre('28|12', '10759') },
  { key: 'comedy', fetchers: genre('35', '35') },
  // film 878 Sci-Fi | 14 Fantasy; serie 10765 Sci-Fi & Fantasy
  { key: 'sciFiFantasy', fetchers: genre('878|14', '10765') },
  // 80 Crime | 9648 Mystery
  { key: 'crimeMystery', fetchers: genre('80|9648', '80|9648') },
  // 16 Animation | 10751 Family
  { key: 'familyAnimation', fetchers: genre('16|10751', '16|10751') },
];

// sezioni con un link nell'header, in ordine di pagina (escluse quelle subito
// sotto la promo: trending); testo in `home.navLabels.<key>`
export const NAV_SECTION_KEYS = [
  'popular',
  'comedy',
  'sciFiFantasy',
  'crimeMystery',
  'familyAnimation',
];

export const anchorId = (key) => `home-${key}`;

// unisce film e serie, toglie i doppioni, ordina per popolarita'
export const mergeSection = (results) => {
  const seen = new Set();
  const merged = [];

  results.forEach(({ type, items }) => {
    (items || []).forEach((item) => {
      const id = `${type}-${item.id}`;

      if (!seen.has(id)) {
        seen.add(id);
        merged.push({ ...item, favourite: false });
      }
    });
  });

  return merged
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, MAX_ITEMS);
};
