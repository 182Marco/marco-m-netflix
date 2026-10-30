import { HOME_SECTIONS, mergeSection } from '../../features/home/sections.js';

const emptySection = () => ({
  data: [],
  loading: false,
  loaded: false,
  error: false,
  // lingua TMDB dei dati (o della richiesta in corso)
  language: '',
});

const initialState = () => {
  const sections = {};

  HOME_SECTIONS.forEach(({ key }) => {
    sections[key] = emptySection();
  });

  return { sections };
};

export default {
  namespaced: true,
  state: initialState,
  mutations: {
    loadStart(state, { key, language }) {
      const section = state.sections[key];

      section.loading = true;
      section.error = false;
      section.language = language;
    },
    loadSuccess(state, { key, data }) {
      const section = state.sections[key];

      section.data = data;
      section.loading = false;
      section.loaded = true;
    },
    loadFailure(state, { key }) {
      const section = state.sections[key];

      section.loading = false;
      section.error = true;
    },
  },
  actions: {
    // una sola richiesta per categoria e lingua: se gia' caricata o in corso no-op
    async load({ state, commit, rootGetters }, key) {
      const config = HOME_SECTIONS.find((s) => s.key === key);
      const section = state.sections[key];
      const language = rootGetters.tmdbLanguage;

      if (
        !config ||
        (section.language === language && (section.loaded || section.loading))
      ) {
        return;
      }

      commit('loadStart', { key, language });

      try {
        const fetchers = config.fetchers(language);
        const responses = await Promise.all(fetchers.map((f) => f.request));

        // la lingua e' cambiata durante la richiesta: risposta scartata
        if (section.language !== language) {
          return;
        }

        commit('loadSuccess', {
          key,
          data: mergeSection(
            responses.map((r, i) => ({
              type: fetchers[i].type,
              items: r.data && r.data.results,
            })),
          ),
        });
      } catch (error) {
        console.error(`Error fetching home section ${key}:`, error);

        if (section.language === language) {
          commit('loadFailure', { key });
        }
      }
    },
  },
};
