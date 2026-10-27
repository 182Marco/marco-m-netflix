import {
  createConversation,
  deleteConversation,
  getConversation,
  isAbortError,
  streamMessage,
} from '../../features/chat/api/chatApi.js';
import { MAX_MESSAGE_CHARS, RECONCILE } from '../../features/chat/config.js';
import { describeFailure } from '../../features/chat/events/failure.js';
import { eventToIntent } from '../../features/chat/events/eventToIntent.js';
import { waitUntilIdle } from '../../features/chat/session/reconcile.js';
import * as reducer from '../../features/chat/state/turnReducer.js';

// Fuori dallo state reattivo: stream e creazione in corso della sessione attiva.
let activeStream = null;
let pendingCreate = null;

const abortActiveStream = () => {
  if (activeStream) {
    activeStream.abort();
  }
  activeStream = null;
  pendingCreate = null;
};

// chiusura best-effort lato server: non tocca mai lo stato
const discardConversation = (id) => {
  if (id) {
    deleteConversation(id).catch(() => {});
  }
};

// vero solo finche' la sessione che ha avviato la richiesta e' quella attiva
const sessionGuard = (state) => {
  const session = state.sessionId;

  return () => state.sessionId === session;
};

const patch =
  (name) =>
  (state, ...args) =>
    Object.assign(state, reducer[name](state, ...args));

// chiavi in locales/texts.js (categoria errors)
const LOST_REPLY = 'errors.lostReply';

const UNREACHABLE = 'errors.unreachable';

export default {
  namespaced: true,

  state: reducer.initialState,

  getters: {
    isBusy: (state) => state.turnStatus !== 'idle',
  },

  mutations: {
    resetChat: patch('resetChat'),
    beginTurn: patch('beginTurn'),
    failTurn: patch('failTurn'),
    discardFailedTurn: patch('discardFailedTurn'),
    forgetConversation: patch('forgetConversation'),
    toggleProcess: patch('toggleProcess'),
    applyIntent: patch('applyIntent'),
    setConversation(state, id) {
      state.conversationId = id;
    },
    setNotice(state, notice) {
      state.notice = notice;
    },
    clearNotice(state) {
      state.notice = null;
    },
    setMoviesPanelVisible(state, visible) {
      state.moviesPanelVisible = visible;
    },
    setTurnsCompleted(state, count) {
      state.turnsCompleted = count;
    },
  },

  actions: {
    // nuova chat: azzera tutto, scarta la vecchia conversazione e ne apre una nuova
    async startNewChat({ commit, dispatch, state }) {
      const previousId = state.conversationId;

      abortActiveStream();
      commit('resetChat');
      discardConversation(previousId);

      const isCurrent = sessionGuard(state);

      try {
        await dispatch('ensureConversation');
      } catch (error) {
        if (isCurrent()) {
          commit('setNotice', describeFailure(error));
        }
      }
    },

    // chiusura della modale: fine della sessione frontend
    endChat({ commit, state }) {
      const previousId = state.conversationId;

      abortActiveStream();
      commit('resetChat');
      discardConversation(previousId);
    },

    // id della conversazione attiva, creandola se serve (una sola creazione per sessione)
    async ensureConversation({ commit, state }) {
      if (state.conversationId) {
        return state.conversationId;
      }
      if (pendingCreate) {
        return pendingCreate;
      }

      const isCurrent = sessionGuard(state);
      const creation = createConversation()
        .then(({ conversation_id: id }) => {
          if (!isCurrent()) {
            discardConversation(id);
            return null;
          }
          commit('setConversation', id);
          return id;
        })
        .finally(() => {
          if (pendingCreate === creation) {
            pendingCreate = null;
          }
        });

      pendingCreate = creation;

      return creation;
    },

    async send({ commit, dispatch, state, rootGetters }, rawContent) {
      const content = `${rawContent}`.trim();

      if (
        !content ||
        content.length > MAX_MESSAGE_CHARS ||
        state.turnStatus !== 'idle'
      ) {
        return;
      }

      const isCurrent = sessionGuard(state);

      commit('beginTurn', content);

      let id;

      try {
        id = await dispatch('ensureConversation');
      } catch (error) {
        if (isCurrent()) {
          commit('failTurn', describeFailure(error));
        }
        return;
      }

      if (!isCurrent() || !id) {
        return;
      }

      const turnsBefore = state.turnsCompleted;
      const stream = new AbortController();

      activeStream = stream;

      const recover = (error) =>
        dispatch('recover', {
          id,
          turnsBefore,
          failure: describeFailure(error),
          isCurrent,
        });

      try {
        await streamMessage(id, content, {
          // valori correnti della modale; null se la configurazione manca
          preferences: rootGetters['chatSettings/preferences'],
          signal: stream.signal,
          onEvent: (event) => {
            if (isCurrent() && event.name === 'turn_start') {
              commit(
                'chatSettings/alignIgnored',
                {
                  applied: event.data.preferences,
                  ignored: event.data.ignored_preferences,
                },
                { root: true },
              );
            }

            const intent = eventToIntent(event);

            if (isCurrent() && intent) {
              commit('applyIntent', intent);
            }
          },
        });
      } catch (error) {
        if (isCurrent() && !isAbortError(error)) {
          await recover(error);
        }
        return;
      }

      // lo stream si e' chiuso senza done/error
      if (isCurrent() && state.turn) {
        await recover({ code: 'stream_interrupted' });
      }
    },

    // dopo errore di rete: il turno potrebbe essere stato elaborato comunque
    async recover({ commit }, { id, turnsBefore, failure, isCurrent }) {
      if (failure.code === 'conversation_not_found') {
        commit('forgetConversation');
      }
      if (!failure.reconcile) {
        commit('failTurn', failure);
        return;
      }

      commit('setNotice', {
        ...failure,
        retryable: false,
        tone: 'info',
        messageKey: 'errors.checking',
      });

      const outcome = await waitUntilIdle({
        poll: () => getConversation(id),
        isCurrent,
        ...RECONCILE,
      });

      if (!isCurrent() || outcome.status === 'stale') {
        return;
      }
      if (outcome.status === 'gone') {
        commit('forgetConversation');
        commit('failTurn', describeFailure({ code: 'conversation_not_found' }));
      } else if (outcome.status === 'timeout') {
        commit('failTurn', {
          ...failure,
          messageKey: UNREACHABLE,
          retryable: false,
        });
      } else if (outcome.turnsCompleted > turnsBefore) {
        commit('setTurnsCompleted', outcome.turnsCompleted);
        commit('failTurn', {
          ...failure,
          messageKey: LOST_REPLY,
          retryable: false,
        });
      } else {
        commit('failTurn', failure);
      }
    },

    // reinvia l'ultimo messaggio dopo un errore con cronologia invariata
    async retry({ commit, dispatch, state }) {
      if (!state.failedTurn || state.turnStatus !== 'idle') {
        return;
      }

      const { content } = state.failedTurn;

      commit('discardFailedTurn');
      await dispatch('send', content);
    },
  },
};
