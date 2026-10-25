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
  const calls = asArray(step.calls).map(str);

  return [
    ...(calls.length ? calls : [str(labels.none)]),
    ...asArray(step.searches).map(wikipediaSearchLine),
    ...asArray(step.opens).map((open) => wikipediaOpenLine(open, labels)),
    ...asArray(step.pages).flatMap((page) => wikipediaPageLines(page, labels)),
    ...asArray(step.hints).map(str),
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
  db_query: dbLines,
  retrieval: ragLines,
  rerank: ragLines,
};

// la fonte YouTube, le attribuzioni JustWatch e la fonte Wikipedia (testo CC BY-SA,
// con licenza e pagine linkate nei `links`) devono restare visibili
const ATTRIBUTIONS = {
  tmdb_calls: tmdbAttributions,
  youtube_calls: (step) => [str(step.source)],
  wikipedia_calls: (step) => [str(step.source)],
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
