// `messageKey`: chiave in locales/texts.js (tradotta al render, non qui); `reconcile`: dopo questo errore il turno potrebbe
// essere comunque arrivato al server (si controlla con GET /conversations/{id}).
const FAILURES = {
  network_error: {
    messageKey: 'errors.network_error',

    retryable: true,
    reconcile: true,
  },
  stream_interrupted: {
    messageKey: 'errors.stream_interrupted',

    retryable: true,
    reconcile: true,
  },
  turn_in_progress: {
    messageKey: 'errors.turn_in_progress',

    retryable: true,
  },
  conversation_not_found: {
    messageKey: 'errors.conversation_not_found',

    retryable: true,
  },
  message_too_long: {
    messageKey: 'errors.message_too_long',

    retryable: false,
  },
  invalid_request: {
    messageKey: 'errors.invalid_request',

    retryable: false,
  },
  turn_failed: {
    messageKey: 'errors.turn_failed',

    retryable: true,
  },
  internal_error: {
    messageKey: 'errors.internal_error',

    retryable: true,
  },
};

const FALLBACK = FAILURES.internal_error;

// accetta errori HTTP/rete del client e il payload dell'evento `error`
export const describeFailure = (error) => {
  const code = (error && error.code) || 'internal_error';
  const known = FAILURES[code] || FALLBACK;

  return {
    code,
    messageKey: known.messageKey,
    retryable: Boolean(known.retryable),
    reconcile: Boolean(known.reconcile),
    tone: 'error',
  };
};
