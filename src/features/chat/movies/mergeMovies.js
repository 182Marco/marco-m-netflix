// media_type dei risultati `lists`: movie e tv usano Card, video ha un fallback
export const isCardItem = (item) =>
  Boolean(item) && (item.media_type === 'movie' || item.media_type === 'tv');

export const isVideoItem = (item) =>
  Boolean(item) && item.media_type === 'video';

const isDisplayable = (item) =>
  typeof item.key === 'string' && (isCardItem(item) || isVideoItem(item));

// Card si aspetta `favourite` sull'oggetto
const withFavourite = (item) =>
  isCardItem(item) ? { ...item, favourite: false } : item;

const uniqueByKey = (items) =>
  items.filter(
    (item, index) =>
      items.findIndex((other) => other.key === item.key) === index,
  );

// tutte le liste tematiche dell'evento -> un'unica lista di item mostrabili
export const flattenLists = (lists) =>
  (Array.isArray(lists) ? lists : [])
    .flatMap((list) => (list && Array.isArray(list.items) ? list.items : []))
    .filter((item) => Boolean(item) && isDisplayable(item));

export const prepareItems = (lists) =>
  uniqueByKey(flattenLists(lists)).map(withFavourite);

// nuovi davanti; i vecchi con la stessa key sono sostituiti dal nuovo
export const mergeMovies = (existing, incoming) => {
  const incomingKeys = new Set(incoming.map((item) => item.key));

  return [
    ...incoming,
    ...existing.filter((item) => !incomingKeys.has(item.key)),
  ];
};
