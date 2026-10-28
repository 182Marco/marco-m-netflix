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
// ogni chiamata HTTP di un tool, nell'ordine in cui è avvenuta: metodo e URL completo
// (path e query) cosi' come li ha inviati il backend, che maschera solo la chiave (***)
const callLine = (call) =>
  typeof call === 'string'
    ? call
    : words(call && call.method, call && call.url);

const callLines = (step) => asArray(step.calls).map(callLine);

const tmdbLines = (step) => callLines(step);

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
  ...callLines(step),
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

const labelsOf = (step) =>
  typeof step.labels === 'object' && step.labels !== null ? step.labels : {};

const wikipediaSearchLine = (search) =>
  words(
    `[${str(search.language)}]`,
    str(search.q),
    '-',
    search.summary,
    search.error ? `(${str(search.error)})` : '',
  );

const wikipediaOpenLine = (open, labels) =>
  words(
    `${str(labels.open)}:`,
    `[${str(open.language)}]`,
    str(open.title),
    '-',
    open.result,
    open.error ? `(${str(open.error)})` : '',
  );

const wikipediaPageLines = (page, labels) => [
  words(
    `[${str(page.language)}]`,
    page.title,
    page.chars ? `(${str(page.chars)})` : '',
  ),
  ...(asArray(page.sections).length
    ? [`${str(labels.sections)}: ${asArray(page.sections).map(str).join(', ')}`]
    : []),
  ...(page.omitted ? [`${page.omitted} ${str(labels.omitted)}`] : []),
  ...(asArray(page.notes).length
    ? [`${str(labels.notes)}: ${asArray(page.notes).map(str).join(', ')}`]
    : []),
];

const wikipediaLines = (step) => {
  const labels = labelsOf(step);
  const calls = callLines(step);

  return [
    ...(calls.length ? calls : [str(labels.none)]),
    ...asArray(step.searches).map(wikipediaSearchLine),
    ...asArray(step.opens).map((open) => wikipediaOpenLine(open, labels)),
    ...asArray(step.pages).flatMap((page) => wikipediaPageLines(page, labels)),
    ...asArray(step.hints).map(str),
  ];
};

const omdbRatingLine = (rating) =>
  words(
    `${str(rating.source_label)}${
      rating.kind_label ? ` [${str(rating.kind_label)}]` : ''
    }:`,
    rating.value,
    rating.votes ? `(${str(rating.votes)})` : '',
  );

const omdbLines = (step) => {
  const labels = labelsOf(step);
  const calls = callLines(step);
  const candidates = asArray(step.candidates);

  return [
    ...(calls.length ? calls : [str(labels.no_calls)]),
    words(
      step.status_label,
      step.work ? `- ${str(step.work)}` : '',
      step.imdb_id ? `(${str(step.imdb_id)})` : '',
    ),
    ...(step.reason ? [str(step.reason)] : []),
    ...asArray(step.ratings).map(omdbRatingLine),
    ...(candidates.length
      ? [
          `${str(labels.candidates)}:`,
          ...candidates.map((item) => `- ${str(item.text)}`),
        ]
      : []),
  ];
};

// link cliccabili: solo https (mai javascript: o http:), gli stessi che il backend ha costruito
const isHttps = (url) => {
  try {
    return new URL(url).protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const wikipediaLinks = (step) => {
  const labels = labelsOf(step);
  const license = typeof step.license === 'object' ? step.license : null;

  return [
    ...asArray(step.pages).map((page) => ({
      label: `${str(page.title)} (${str(page.language)}.wikipedia.org)`,
      url: str(page.url),
    })),
    ...(license
      ? [
          {
            label: `${str(labels.license)}: ${str(license.name)}`,
            url: str(license.url),
          },
        ]
      : []),
  ];
};

const LINES = {
  tmdb_calls: tmdbLines,
  youtube_calls: youtubeLines,
  wikipedia_calls: wikipediaLines,
  omdb_calls: omdbLines,
  db_query: dbLines,
  retrieval: ragLines,
  rerank: ragLines,
};

// la fonte YouTube, le attribuzioni JustWatch, la fonte Wikipedia (testo CC BY-SA,
// con licenza e pagine linkate nei `links`) e la fonte OMDb devono restare visibili
const ATTRIBUTIONS = {
  tmdb_calls: tmdbAttributions,
  youtube_calls: (step) => [str(step.source)],
  wikipedia_calls: (step) => [str(step.source)],
  omdb_calls: (step) => [str(step.source)],
};

const LINKS = {
  wikipedia_calls: wikipediaLinks,
};

// un kind sconosciuto resta un blocco generico con il solo titolo
export const stepToEntry = (step) => {
  const lines = (LINES[step.kind] || (() => []))(step);
  const attributions = (ATTRIBUTIONS[step.kind] || (() => []))(step);
  const links = (LINKS[step.kind] || (() => []))(step);

  return {
    kind: 'step',
    stepKind: str(step.kind),
    title: str(step.title) || str(step.kind),
    lines: lines.filter(Boolean),
    attributions: attributions.filter(Boolean),
    links: links.filter((link) => isHttps(link.url)),
  };
};
