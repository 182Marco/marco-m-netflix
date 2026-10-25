// Mini renderer Markdown per il testo della risposta: l'HTML viene sempre
// escapato prima, quindi il risultato e' sicuro per v-html.
const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

const inline = (text) =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );

const BULLET = /^\s*[-*]\s+/;
const NUMBER = /^\s*\d+[.)]\s+/;
const HEADING = /^#{1,6}\s+/;

const lineType = (line) => {
  if (line.trim() === '') return 'blank';
  if (BULLET.test(line)) return 'ul';
  if (NUMBER.test(line)) return 'ol';
  if (HEADING.test(line)) return 'h';
  return 'p';
};

// righe consecutive dello stesso tipo -> un blocco; riga vuota chiude il blocco
const toBlocks = (lines) =>
  lines
    .reduce((blocks, line) => {
      const type = lineType(line);
      const last = blocks[blocks.length - 1];

      if (type === 'blank') return [...blocks, null];
      if (last && last.type === type && type !== 'h') {
        return [...blocks.slice(0, -1), { type, lines: [...last.lines, line] }];
      }
      return [...blocks, { type, lines: [line] }];
    }, [])
    .filter(Boolean);

const items = (lines, marker) =>
  lines.map((line) => `<li>${inline(line.replace(marker, ''))}</li>`).join('');

const RENDER = {
  ul: ({ lines }) => `<ul>${items(lines, BULLET)}</ul>`,
  ol: ({ lines }) => `<ol>${items(lines, NUMBER)}</ol>`,
  h: ({ lines }) =>
    `<p><strong>${inline(lines[0].replace(HEADING, ''))}</strong></p>`,
  p: ({ lines }) => `<p>${lines.map(inline).join('<br>')}</p>`,
};

export const renderMarkdown = (text) =>
  toBlocks(`${text || ''}`.trim().split(/\r?\n/))
    .map((block) => RENDER[block.type](block))
    .join('');
