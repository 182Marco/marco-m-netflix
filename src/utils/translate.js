import { TEXTS, DEFAULT_LANGUAGE } from '@locales/texts';

// path 'categoria.chiave'; se manca la lingua si usa l'inglese, poi il path
export const translate = (path, language) => {
  const [category, key] = String(path).split('.');
  const entry = TEXTS[category] && TEXTS[category][key];

  if (!entry) {
    return path;
  }

  return entry[language] || entry[DEFAULT_LANGUAGE] || path;
};
