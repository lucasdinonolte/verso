export const normalizeChildren = (items) =>
  (Array.isArray(items) ? items : [items]).flat(Infinity);
