import { prepareItems } from '../movies/mergeMovies.js';
import { stepToEntry, storyToEntry } from '../messages/render.js';
import { describeFailure } from './failure.js';

const isObject = (value) => typeof value === 'object' && value !== null;

// evento SSE { name, data } -> intento per il reducer (o null se da ignorare).
// status e turn_start non portano nulla: la story `progress` li accompagna.
const HANDLERS = {
  story: (data) => ({ type: 'process-entry', entry: storyToEntry(data) }),
  step: (data) => ({ type: 'process-entry', entry: stepToEntry(data) }),
  answer_delta: (data) =>
    typeof data.text === 'string'
      ? { type: 'answer-append', text: data.text }
      : null,
  answer_end: (data) => ({
    type: 'answer-end',
    replace: typeof data.replace === 'string' ? data.replace : null,
    language: data.language || null,
    blocked: Boolean(data.blocked),
  }),
  lists: (data) => ({ type: 'lists', items: prepareItems(data.lists) }),
  done: () => ({ type: 'turn-done' }),
  error: (data) => ({ type: 'turn-error', failure: describeFailure(data) }),
};

export const eventToIntent = ({ name, data }) => {
  const handler = HANDLERS[name];

  return handler && isObject(data) ? handler(data) : null;
};
