const BLOCK_END = /\r?\n\r?\n/;
const LINE_END = /\r?\n/;

const fieldValues = (lines, name) =>
  lines
    .filter((line) => line.startsWith(`${name}:`))
    .map((line) => line.slice(name.length + 1).replace(/^ /, ''));

const parseJson = (text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
};

// un blocco senza event/data (heartbeat ": ping") o con JSON rotto -> null
export const parseBlock = (block) => {
  const lines = block.split(LINE_END);
  const [name] = fieldValues(lines, 'event');
  const data = fieldValues(lines, 'data').join('\n');

  if (!name || !data) {
    return null;
  }

  const parsed = parseJson(data);

  return parsed === null ? null : { name, data: parsed };
};

// incrementale e puro: `rest` e' il testo non ancora terminato da una riga vuota
export const parseSseChunk = (rest, chunk) => {
  const blocks = `${rest}${chunk}`.split(BLOCK_END);
  const nextRest = blocks.pop();

  return { events: blocks.map(parseBlock).filter(Boolean), rest: nextRest };
};
