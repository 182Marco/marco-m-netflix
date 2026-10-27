import { createStore } from 'vuex';
import { searchMovies, searchSeries } from '../features/auth/api/tmdbApi';
import { translate } from '../utils/translate';
import { LANGUAGES, DEFAULT_LANGUAGE } from '@locales/texts';
import chat from './modules/chat';
import chatSettings from './modules/chatSettings';

// lingua salvata dall'utente (solo se e' una di quelle supportate)
const loadLanguage = () => {
  try {
    const saved =
      typeof window !== 'undefined' && window.localStorage.getItem('language');

    return LANGUAGES.some((l) => l.code === saved) ? saved : DEFAULT_LANGUAGE;
  } catch (error) {
    return DEFAULT_LANGUAGE;
  }
};

const applyLanguage = (language) => {
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', language);
    }
  } catch (error) {
    // storage non disponibile: la lingua vale solo per la sessione
  }
};

const store = createStore({
  modules: { chat, chatSettings },
  state: {
    // colorare nav
    colNav: false,
    transparent: true,
    fillBlack: false,
    showPromo: true,
    // dati per tipo di query
    query: '',
    // codice breve (en, it, es, de, fr); il tag TMDB e' nel getter tmdbLanguage
    language: loadLanguage(),
    // array ricercati
    movies: [],
    series: [],
    // array film e serie preferiti
    favouriteMovies: [],
    favouriteSeries: [],
    // dati api
    apikey: process.env.VUE_APP_TMDB_API_KEY || '',
    basicUrl:
      process.env.VUE_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    apiMv: '/movie',
    apiTv: '/tv',
  },
  getters: {
    // tag per il parametro `language` di TMDB (en-US, it-IT, ...)
    tmdbLanguage: (state) =>
      (LANGUAGES.find((l) => l.code === state.language) || LANGUAGES[0]).tmdb,
    // t('categoria.chiave') -> testo nella lingua corrente
    t: (state) => (path) => translate(path, state.language),
  },
  mutations: {
    // riempimento variabili in store x query
    setQuery(state, query) {
      state.query = query;
      state.showPromo = !query;

      if (!query) {
        state.movies = [];
        state.series = [];
      }
    },
    setLanguage(state, language) {
      state.language = language;
      applyLanguage(language);
    },
    // aggiungere ai film favoriti:
    // per distinguere film da serie sfrutto
    // il fatto che le serie hanno la prop
    // name al posto della prop titolo
    pushFavuriteObj(state, obj) {
      obj.title
        ? state.favouriteMovies.push(obj)
        : state.favouriteSeries.push(obj);
    },
    // rimuovere dai film favoriti
    removeFavuriteObj(state, obj) {
      obj.title
        ? (state.favouriteMovies = [
            ...state.favouriteMovies.filter((e) => e.id != obj.id),
          ])
        : (state.favouriteSeries = [
            ...state.favouriteSeries.filter((e) => e.id != obj.id),
          ]);
    },
    // cambiare colore della barra
    toggleColNav(state) {
      state.colNav = !state.colNav;
    },
    goTransparent(state) {
      state.transparent = true;
      state.fillBlack = false;
    },
    black(state) {
      state.transparent = false;
      state.fillBlack = true;
    },
    // settare array di film ricercati
    setSearchedMovies(state, searched) {
      state.movies = searched;
    },
    // settare array di serie ricercati
    setSearchedSeries(state, searched) {
      state.series = searched;
    },
  },
  actions: {
    // cambiare colore della barra
    changeColNav({ commit, state }) {
      commit('toggleColNav');
      state.colNav ? commit('black') : commit('goTransparent');
    },
    // chiamata axios quando si fa ricerca
    async getAllData({ state, getters, commit }) {
      if (!state.query) {
        commit('setQuery', '');
        return;
      }

      try {
        // chiamata per i film
        const moviesResponse = await searchMovies({
          query: state.query,
          language: getters.tmdbLanguage,
        });
        moviesResponse.data.result = [
          ...moviesResponse.data.results.map((e) => ({
            ...e,
            favourite: false,
          })),
        ];
        commit('setSearchedMovies', moviesResponse.data.result);

        // chimata per le serie
        const seriesResponse = await searchSeries({
          query: state.query,
          language: getters.tmdbLanguage,
        });
        seriesResponse.data.result = [
          ...seriesResponse.data.results.map((e) => ({
            ...e,
            favourite: false,
          })),
        ];
        commit('setSearchedSeries', seriesResponse.data.result);
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    },
  },
});

export default store;
