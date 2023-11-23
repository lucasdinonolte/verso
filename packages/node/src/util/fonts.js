import { parse } from 'opentype.js';

export const parseFonts = (fonts) => {
  const parsed = fonts.map((f) => ({
    ...f,
    data: parse(f.data),
  }));

  return (family) => {
    const font = parsed.find((f) => f.name === family);

    if (!font) {
      throw new Error(`Font ${fontFamily} not found`);
    }

    return font;
  };
};
