import { getSettings } from '../../features/chat/api/chatApi.js';
import {
  alignIgnored,
  buildPreferences,
  defaultValues,
  normalizeSettings,
} from '../../features/chat/settings/settings.js';

const initialState = () => ({
  status: 'idle', // idle | loading | ready | error
  fields: [],
  values: {},
  loadId: 0, // cambia a ogni reset: scarta le risposte vecchie
});

export default {
  namespaced: true,

  state: initialState,

  getters: {
    isReady: (state) => state.status === 'ready',
    // null se la configurazione non c'e': nessun campo `preferences`
    preferences: (state) =>
      state.status === 'ready'
        ? buildPreferences(state.fields, state.values)
        : null,
  },

  mutations: {
    startLoading(state) {
      state.status = 'loading';
    },
    setLoaded(state, fields) {
      state.status = 'ready';
      state.fields = fields;
      state.values = defaultValues(fields);
    },
    setFailed(state) {
      state.status = 'error';
      state.fields = [];
      state.values = {};
    },
    setValue(state, { id, value }) {
      state.values = { ...state.values, [id]: value };
    },
    restoreDefaults(state) {
      state.values = defaultValues(state.fields);
    },
    alignIgnored(state, { applied, ignored }) {
      state.values = alignIgnored(state.values, applied, ignored);
    },
    reset(state) {
      Object.assign(state, initialState(), { loadId: state.loadId + 1 });
    },
  },

  actions: {
    // una sola richiesta per ingresso in chat; chiamate ripetute sono no-op
    async load({ commit, state }) {
      if (state.status === 'loading' || state.status === 'ready') {
        return;
      }

      const loadId = state.loadId;

      commit('startLoading');

      try {
        const raw = await getSettings();

        const fields = normalizeSettings(raw);

        if (state.loadId === loadId) {
          commit(fields.length > 0 ? 'setLoaded' : 'setFailed', fields);
        }
      } catch (error) {
        if (state.loadId === loadId) {
          commit('setFailed');
        }
      }
    },
  },
};
