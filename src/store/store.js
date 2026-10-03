import Vue from 'vue';
import Vuex from 'vuex';
// moduli
import accessData from './modules/accessData.js';
import { searchMovies, searchSeries } from '../features/auth/api/tmdbApi';

Vue.use(Vuex);

const store = () => {
  return new Vuex.Store({
    state: {
      // accesso all'app
      loginDone: true,
      accountDone: true,
      // colorare nav
      colNav: false,
      transparent: true,
      fillBlack: false,
      // dati per tipo di query
      query: '',
      language: 'en-US',
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
      // bandiere
      flags: ['en', 'it'],
    },
    getters: {},
    mutations: {
      // accesso all'app
      loginOk(state) {
        state.loginDone = true;
      },
      accountChosen(state) {
        state.accountDone = true;
      },
      // riempimento variabili in store x query
      setQuery(state, query) {
        state.query = query;
      },
      setLanguage(state, language) {
        state.language = language;
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
      async getAllData({ state, commit }) {
        if (state.query !== '') {
          try {
            // chiamata per i film
            const moviesResponse = await searchMovies({
              query: state.query,
              language: state.language,
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
              language: state.language,
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
        }
      },
    },
    modules: {
      accessData,
    },
  });
};

export default store;
