import { BASE_URL } from '../config.js';
import { parseSseChunk } from '../sse/parseSse.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const isAbortError = (error) =>
  Boolean(error) && error.name === 'AbortError';

const networkError = () => ({ code: 'network_error', status: 0 });

// errori HTTP del contratto: { error: { code, message } }
const readApiError = async (response) => {
  const body = await response.json().catch(() => null);
  const { code, message } = (body && body.error) || {};

  return { code: code || 'http_error', message, status: response.status };
};

const request = async (path, options) => {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, options);
  } catch (error) {
    throw isAbortError(error) ? error : networkError();
  }

  if (!response.ok) {
    throw await readApiError(response);
  }

  return response;
};

export const getSettings = () => request('/settings').then((res) => res.json());

const conversationPath = (id) => `/conversations/${encodeURIComponent(id)}`;

export const createConversation = () =>
  request('/conversations', { method: 'POST' }).then((res) => res.json());

export const getConversation = (id) =>
  request(conversationPath(id)).then((res) => res.json());

export const deleteConversation = (id) =>
  request(conversationPath(id), { method: 'DELETE' });

const readChunk = (reader) =>
  reader.read().catch((error) => {
    throw isAbortError(error) ? error : networkError();
  });

const readEvents = async (body, onEvent) => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let rest = '';

  for (;;) {
    const { value, done } = await readChunk(reader);

    if (done) {
      return;
    }

    const parsed = parseSseChunk(rest, decoder.decode(value, { stream: true }));

    rest = parsed.rest;
    parsed.events.forEach(onEvent);
  }
};

// risolve quando lo stream si chiude; onEvent riceve { name, data }
export const streamMessage = async (
  id,
  content,
  { preferences, signal, onEvent },
) => {
  const response = await request(`${conversationPath(id)}/messages`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(preferences ? { content, preferences } : { content }),
    signal,
  });

  await readEvents(response.body, onEvent);
};
