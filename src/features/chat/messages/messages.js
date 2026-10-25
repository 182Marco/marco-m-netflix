// Shape: { id, role: 'user' | 'assistant' | 'agent-process', text, timestamp,
//          title?, isOpen?, entries?, attributions? }
const pad = (n) => `${n}`.padStart(2, '0');

export const formatTime = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const createMessage = (id, role, text, extra = {}) => ({
  id,
  role,
  text,
  timestamp: formatTime(new Date()),
  ...extra,
});

// i tre messaggi di un turno + gli id che li legano
export const buildTurn = (startId, content) => {
  const [userId, processId, answerId] = [startId, startId + 1, startId + 2];

  return {
    messages: [
      createMessage(userId, 'user', content),
      createMessage(processId, 'agent-process', '', {
        title: 'Agent Process',
        isOpen: true,
        entries: [],
      }),
      createMessage(answerId, 'assistant', '', { attributions: [] }),
    ],
    turn: { userId, processId, answerId, content },
    nextId: startId + 3,
  };
};

export const updateMessage = (messages, id, update) =>
  messages.map((message) => (message.id === id ? update(message) : message));

export const removeMessages = (messages, ids) =>
  messages.filter((message) => !ids.includes(message.id));

export const appendText = (text) => (message) => ({
  ...message,
  text: `${message.text}${text}`,
});

export const addEntry = (entry) => (message) => ({
  ...message,
  entries: [...message.entries, entry],
});

export const addAttributions = (texts) => (message) => ({
  ...message,
  attributions: [...new Set([...message.attributions, ...texts])],
});

export const toggleOpen = (message) => ({
  ...message,
  isOpen: !message.isOpen,
});

const isEmptyTurnMessage = (message) =>
  (message.role === 'assistant' && message.text === '') ||
  (message.role === 'agent-process' && message.entries.length === 0);

// a fine turno spariscono i bubble rimasti vuoti (accordion senza passi, risposta vuota)
export const pruneEmptyTurnMessages = (messages, turn) =>
  messages.filter(
    (message) =>
      ![turn.processId, turn.answerId].includes(message.id) ||
      !isEmptyTurnMessage(message),
  );
