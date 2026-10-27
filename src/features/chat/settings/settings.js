// Funzioni pure sulla configurazione di GET /settings (unica fonte di campi,
// opzioni, etichette e default). Campi e tipi sconosciuti vengono ignorati.
const isObject = (value) => typeof value === 'object' && value !== null;

const hasLabel = (label) => isObject(label) && typeof label.en === 'string';

const normalizeOptions = (options) =>
  Array.isArray(options)
    ? options.filter(
        (option) =>
          isObject(option) &&
          typeof option.value === 'string' &&
          hasLabel(option.label),
      )
    : [];

const FIELD_NORMALIZERS = {
  boolean: (field) =>
    typeof field.default === 'boolean' ? { ...field } : null,
  choice: (field) => {
    const options = normalizeOptions(field.options);

    return options.some((option) => option.value === field.default)
      ? { ...field, options }
      : null;
  },
};

const normalizeField = (field) =>
  isObject(field) &&
  typeof field.id === 'string' &&
  hasLabel(field.label) &&
  FIELD_NORMALIZERS[field.type]
    ? FIELD_NORMALIZERS[field.type](field)
    : null;

export const normalizeSettings = (raw) =>
  isObject(raw) && Array.isArray(raw.fields)
    ? raw.fields.map(normalizeField).filter(Boolean)
    : [];

export const defaultValues = (fields) =>
  Object.fromEntries(fields.map((field) => [field.id, field.default]));

// null se non c'e' uno schema: il messaggio parte senza `preferences`
export const buildPreferences = (fields, values) =>
  fields.length === 0
    ? null
    : Object.fromEntries(fields.map((field) => [field.id, values[field.id]]));

// lang: codice breve ('en', 'it', 'es', ...); un tag ('it-IT') si accorcia.
// Il backend manda ogni label in tutte le lingue; se manca si usa `en`.
export const localize = (label, lang) =>
  label[`${lang}`.split('-')[0]] || label.en;

// riallinea solo i campi che il backend ha scartato, senza toccare le altre scelte
export const alignIgnored = (values, applied, ignored) => {
  if (!isObject(applied) || !Array.isArray(ignored)) {
    return values;
  }

  const next = { ...values };

  ignored.forEach((id) => {
    if (id in next && id in applied) {
      next[id] = applied[id];
    }
  });

  return next;
};
