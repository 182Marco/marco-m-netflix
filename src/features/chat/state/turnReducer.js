import { mergeMovies } from '../movies/mergeMovies.js';
import {
  addAttributions,
  addEntry,
  appendText,
  buildTurn,
  pruneEmptyTurnMessages,
  removeMessages,
  toggleOpen,
  updateMessage,
} from '../messages/messages.js';

// Ogni funzione e' pura: (state, ...args) => patch. Le mutation dello store
// fanno solo Object.assign(state, patch).
export const initialState = () => ({
  sessionId: 0, // cambia a ogni nuova chat/chiusura: scarta le callback vecchie
  conversationId: null,
  turnsCompleted: 0,
  messages: [],
  nextId: 1,
  turn: null, // { userId, processId, answerId, content } del turno in corso
  turnStatus: 'idle', // idle | waiting | streaming
  notice: null, // { code, messageKey, retryable, tone }
  failedTurn: null, // { ids, content } se l'utente puo' riprovare
  movies: [],
  moviesPanelVisible: false,
});

export const resetChat = (state) => ({
  ...initialState(),
  sessionId: state.sessionId + 1,
});

export const beginTurn = (state, content) => {
  const { messages, turn, nextId } = buildTurn(state.nextId, content);

  return {
    messages: [...state.messages, ...messages],
    turn,
    nextId,
    turnStatus: 'waiting',
    notice: null,
    failedTurn: null,
  };
};

const turnIds = (turn) => [turn.userId, turn.processId, turn.answerId];

export const failTurn = (state, failure) =>
  state.turn
    ? {
        messages: pruneEmptyTurnMessages(state.messages, state.turn),
        turn: null,
        turnStatus: 'idle',
        notice: failure,
        failedTurn: failure.retryable
          ? { ids: turnIds(state.turn), content: state.turn.content }
          : null,
      }
    : {};

export const finishTurn = (state) => ({
  messages: pruneEmptyTurnMessages(state.messages, state.turn),
  turn: null,
  turnStatus: 'idle',
  turnsCompleted: state.turnsCompleted + 1,
});

export const discardFailedTurn = (state) =>
  state.failedTurn
    ? {
        messages: removeMessages(state.messages, state.failedTurn.ids),
        failedTurn: null,
        notice: null,
      }
    : {};

export const forgetConversation = () => ({
  conversationId: null,
  turnsCompleted: 0,
});

export const toggleProcess = (state, messageId) => ({
  messages: updateMessage(state.messages, messageId, toggleOpen),
});

// ---- intenti prodotti da eventToIntent (valgono solo con un turno in corso)
const onEntry = (state, { entry }) => ({
  messages: updateMessage(
    updateMessage(state.messages, state.turn.processId, addEntry(entry)),
    state.turn.answerId,
    addAttributions(entry.attributions || []),
  ),
});

const onAnswerAppend = (state, { text }) => ({
  messages: updateMessage(
    state.messages,
    state.turn.answerId,
    appendText(text),
  ),
  turnStatus: 'streaming',
});

const onAnswerEnd = (state, { replace, language, blocked }) => ({
  messages: updateMessage(state.messages, state.turn.answerId, (message) => ({
    ...message,
    text: (replace === null ? message.text : replace).trim(),
    language,
    blocked,
  })),
});

// nessun film nel turno: lista e finestra restano come sono
const onLists = (state, { items }) =>
  items.length === 0
    ? {}
    : {
        movies: mergeMovies(state.movies, items),
        moviesPanelVisible: true,
      };

const INTENTS = {
  'process-entry': onEntry,
  'answer-append': onAnswerAppend,
  'answer-end': onAnswerEnd,
  lists: onLists,
  'turn-done': (state) => finishTurn(state),
  'turn-error': (state, { failure }) => failTurn(state, failure),
};

export const applyIntent = (state, intent) =>
  state.turn && INTENTS[intent.type] ? INTENTS[intent.type](state, intent) : {};
