import { TEXTS, DEFAULT_LANGUAGE } from '@locales/texts';

// path 'categoria.chiave' (anche piu' livelli: 'home.sections.popular');
// se manca la lingua si usa l'inglese, poi il path
export const translate = (path, language) => {
  const entry = String(path)
    .split('.')
    .reduce((node, part) => (node ? node[part] : undefined), TEXTS);

  if (!entry || typeof entry !== 'object') {
    return path;
  }

  return entry[language] || entry[DEFAULT_LANGUAGE] || path;
};
