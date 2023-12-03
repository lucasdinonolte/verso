export const normalizeChildren = (items) =>
  (Array.isArray(items) ? items : [items]).flat(Infinity);

export const isBrowser =
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  typeof document !== 'undefined';

/**
 * @param {Object} obj
 * @param {string[]} names The keys to omit
 * @return {Object} A new object with the keys ommitted
 */
export const omit = (obj, names) => {
  let result = {};
  let index = {};
  let idx = 0;
  const len = names.length;

  while (idx < len) {
    index[names[idx]] = 1;
    idx += 1;
  }

  for (const prop in obj) {
    if (!index.hasOwnProperty(prop)) {
      result[prop] = obj[prop];
    }
  }
  return result;
};
