const countWords = str => str.trim().split(/\s+/).length;

const hasMoreThanWords = (str, n) => countWords(str) > (n || 60);

const getFirstWords = (str, n) =>
  str
    .split(/\s+/)
    .slice(0, n || 60)
    .join(' ');

const getRemainingText = (str, n) =>
  str
    .split(/\s+/)
    .slice(n || 60)
    .join(' ');

const findCutIndex = str => str.search(/[.,]/);

const clipLongText = (str, n) => {
  if (!hasMoreThanWords(str, n)) {
    return str;
  }

  const firstPart = getFirstWords(str, n);
  const remainingText = getRemainingText(str, n);
  const cutIndex = findCutIndex(remainingText, n);

  if (cutIndex !== -1) {
    return firstPart + remainingText.substring(0, cutIndex + 1) + '...';
  }

  return firstPart + ' ...';
};

export { clipLongText };
