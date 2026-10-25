// Messaggi per l'utente; `reconcile`: dopo questo errore il turno potrebbe
// essere comunque arrivato al server (si controlla con GET /conversations/{id}).
const FAILURES = {
  network_error: {
    message: 'Connection to the server lost.',
    retryable: true,
    reconcile: true,
  },
  stream_interrupted: {
    message: 'The reply was interrupted.',
    retryable: true,
    reconcile: true,
  },
  turn_in_progress: {
    message:
      'The assistant is still working on the previous message. Try again in a moment.',
    retryable: true,
  },
  conversation_not_found: {
    message:
      'The conversation expired. Retrying starts a new one (earlier context is lost).',
    retryable: true,
  },
  message_too_long: {
    message: 'The message is too long.',
    retryable: false,
  },
  invalid_request: {
    message: 'The message was not accepted.',
    retryable: false,
  },
  turn_failed: {
    message: 'The assistant could not answer. Try again.',
    retryable: true,
  },
  internal_error: {
    message: 'Something went wrong on the server. Try again.',
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
    message: known.message,
    retryable: Boolean(known.retryable),
    reconcile: Boolean(known.reconcile),
    tone: 'error',
  };
};
