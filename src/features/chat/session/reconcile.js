const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dopo una disconnessione: attende che il server finisca il turno.
// poll() = GET /conversations/{id}; isCurrent() blocca le sessioni obsolete.
// Esiti: stale | gone | timeout | idle (con turnsCompleted).
export const waitUntilIdle = async ({
  poll,
  isCurrent,
  attempts,
  intervalMs,
  sleep = wait,
}) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!isCurrent()) {
      return { status: 'stale' };
    }

    try {
      const conversation = await poll();

      if (!isCurrent()) {
        return { status: 'stale' };
      }
      if (!conversation.busy) {
        return { status: 'idle', turnsCompleted: conversation.turns_completed };
      }
    } catch (error) {
      if (error && error.status === 404) {
        return { status: 'gone' };
      }
    }

    await sleep(intervalMs);
  }

  return { status: isCurrent() ? 'timeout' : 'stale' };
};
