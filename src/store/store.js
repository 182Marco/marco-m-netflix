import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const store = () => {
  return new Vuex.Store({
    state: {
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
      apikey: '5f6d881d6af75a5cb6855a550e2cd3d2',
      basicUrl: 'https://api.themoviedb.org/3',
      apiMv: '/movie',
      apiTv: '/tv',
      // bandiere
      flags: ['en', 'it'],
    },
    getters: {},
    mutations: {
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
              ...state.favouriteMovies.filter(e => e.id != obj.id),
            ])
          : (state.favouriteSeries = [
              ...state.favouriteSeries.filter(e => e.id != obj.id),
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
      getAllData({ state, commit }) {
        if (state.query !== '') {
          // chiamata per i film
          axios
            .get(
              `${state.basicUrl}/search${state.apiMv}?api_key=${state.apikey}&query=${state.query}
              &language=${state.language}
            `
            )
            .then(res => {
              // aumentare le props con una favurite true/false
              res.data.result = [
                ...res.data.results.map(e => ({ ...e, favourite: false })),
              ];
              commit('setSearchedMovies', res.data.result);
            });
          // chimata per le serie
          axios
            .get(
              `${state.basicUrl}/search${state.apiTv}?api_key=${state.apikey}&query=${state.query}
                &language=${state.language}
                `
            )
            .then(r => {
              // aumentare le props con una favurite true/false
              r.data.result = [
                ...r.data.results.map(e => ({ ...e, favourite: false })),
              ];
              commit('setSearchedSeries', r.data.result);
            });
        }
      },
    },
  });
};

export default store;
