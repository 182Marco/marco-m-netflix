const asArray = (value) => (Array.isArray(value) ? value : []);
const str = (value) => (typeof value === 'string' ? value : '');
const words = (...parts) => parts.map(str).filter(Boolean).join(' ');

const ICONS = { progress: '…', info: 'i', ok: '✓', warn: '!' };

export const levelIcon = (level) => ICONS[level] || ICONS.info;

export const storyToEntry = ({ level, text }) => ({
  kind: 'story',
  level: str(level) || 'info',
  text: str(text),
});

// ---- righe per tipo di step (campi: presenters/web/<tool>/serializer.py)
const tmdbLines = (step) =>
  asArray(step.calls).map((call) => words(call.label, call.url));

const tmdbAttributions = (step) =>
  asArray(step.attributions).map((item) => str(item.text));

const videoLine = (video) =>
  words(
    video.kind_label,
    video.title,
    '-',
    video.channel,
    video.published,
    video.url,
  );

const searchLine = (search) =>
  words(
    `${str(search.kind_label)}:`,
    `"${str(search.q)}"`,
    '-',
    search.summary,
    search.error ? `(${str(search.error)})` : '',
  );

const youtubeLines = (step) => [
  ...asArray(step.calls).map(str),
  ...asArray(step.searches).map(searchLine),
  ...asArray(step.groups).flatMap((group) =>
    [...asArray(group.confirmed), ...asArray(group.to_verify)].map(videoLine),
  ),
  ...asArray(step.hints).map(str),
];

const dbLines = (step) =>
  asArray(step.queries).map((query) => str(query.display_sql || query.sql));

const chunkLine = (chunk) =>
  words(
    chunk.title || chunk.id,
    chunk.year ? `(${str(chunk.year)})` : '',
    typeof chunk.score === 'number' ? `· ${chunk.score.toFixed(3)}` : '',
  );

const ragLines = (step) => [
  ...(step.embedded_text ? [`"${str(step.embedded_text)}"`] : []),
  ...asArray(step.chunks).map(chunkLine),
];

const LINES = {
  tmdb_calls: tmdbLines,
  youtube_calls: youtubeLines,
  db_query: dbLines,
  retrieval: ragLines,
  rerank: ragLines,
};

// la fonte YouTube e le attribuzioni JustWatch devono restare visibili
const ATTRIBUTIONS = {
  tmdb_calls: tmdbAttributions,
  youtube_calls: (step) => [str(step.source)],
};

// un kind sconosciuto resta un blocco generico con il solo titolo
export const stepToEntry = (step) => {
  const lines = (LINES[step.kind] || (() => []))(step);
  const attributions = (ATTRIBUTIONS[step.kind] || (() => []))(step);

  return {
    kind: 'step',
    stepKind: str(step.kind),
    title: str(step.title) || str(step.kind),
    lines: lines.filter(Boolean),
    attributions: attributions.filter(Boolean),
  };
};
