import { default as LineBreaker } from 'linebreak';
import { parse } from 'opentype.js';
import {
  default as createPath,
  moveTo,
  lineTo,
  curveTo,
  close,
} from './path.js';

/**
 * @typedef {Object} TextOptions
 * @property {number} fontSize
 * @property {boolean} kerning
 * @property {number} letterSpacing
 * @property {number} lineHeight
 */

/**
 * @typedef {Object} Font
 * @property {"font"} type
 * @property {ArrayBuffer} buffer
 * @property {string} name
 * @property {(text: string, options: TextOptions) => number} getAdvanceWidth
 * @property {(text: string, x: number, y: number, options: TextOptions) => Path} convertToPath
 */

/**
 * Returns the x-coordinate for the start of a line
 * based on its alignment.
 *
 * @param {number} width
 * @param {number} lineWidth
 * @param {"left" | "center" | "right"} align
 * @returns {number}
 */
const getLineStartX = (width, lineWidth, align) => {
  if (align === 'center') {
    return (width - lineWidth) / 2;
  }

  if (align === 'right') {
    return width - lineWidth;
  }

  return 0;
};

/**
 * Registers a new font returning a Font object
 *
 * @param {ArrayBuffer} data
 * @returns {Font}
 */
export const registerFont = (data) => {
  const parsed = parse(data);

  const PATH_CACHE = new Map();

  return {
    type: 'font',
    name: parsed.names.fullName.en,
    buffer: data,
    getAdvanceWidth(text, options) {
      const { fontSize, ...rest } = options;
      return parsed.getAdvanceWidth(text, fontSize, rest);
    },

    /**
     * Converts text to a Path object, which is rather expensive.
     * So you should only ever do it, if you need to work with information
     * on the texts path directly. For rendering text this isn’t needed.
     */
    convertToPath(text, x, y, options = {}) {
      const cacheKey = `${text}-${x}-${y}-${fontSize}-${JSON.stringify(
        options
      )}`;

      const { fontSize, ...rest } = options;

      if (PATH_CACHE.has(cacheKey)) return PATH_CACHE.get(cacheKey);

      const rawPath = parsed.getPath(text, x, y, fontSize, rest).toPathData(9);
      const path = createPath(rawPath);

      PATH_CACHE.set(cacheKey, path);
      return path;
    },

    /**
     * Converts text to an Array of drawing commands to be passed to
     * a renderer.
     */
    convertToCommands(text, x, y, options) {
      const { fontSize } = options;
      const path = parsed.getPath(text, x, y, fontSize, options);

      return path.commands.map((command) => {
        switch (command.type) {
          case 'M': {
            return moveTo(command.x, command.y);
          }
          case 'L': {
            return lineTo(command.x, command.y);
          }
          case 'Q': {
            console.log('TODO: Implement quadratic curve command');
          }
          case 'C': {
            return curveTo(
              command.x1,
              command.y1,
              command.x2,
              command.y2,
              command.x,
              command.y
            );
          }
          case 'Z': {
            return close();
          }
        }
      });
    },
    /**
     * Wraps the text to fit into the given width and height.
     * Returns an array of lines.
     */
    getLines(text, width, height, options = {}) {
      const { fontSize, lineHeight, align } = options;
      const lines = [];
      const breaker = new LineBreaker(text);

      // Line height calculation as per CSS spec
      const AD =
        Math.abs(parsed.ascender - parsed.descender) / parsed.unitsPerEm;
      const lh = (lineHeight ?? fontSize) / fontSize;
      const L = lh - AD;

      let line = '';
      let last = 0;
      let bk;
      let yOff = fontSize + -(parsed.ascender / parsed.unitsPerEm) - L / 2;
      let lastLineWidth = 0;
      let hasHyphenationOpportunity = false;

      let curHeight = fontSize;
      let requiredBreakAfter = false;
      let canFitNextLine = true;

      while ((bk = breaker.nextBreak())) {
        const { position, required } = bk;
        const rawWord = text.slice(last, position);
        const canHyphenate = rawWord.endsWith('\u00AD');
        const word = rawWord.replace('\u00AD', '');
        const nextLine = line + word;

        const lineWidth = this.getAdvanceWidth(nextLine, options);
        const exceedsWidth = width && lineWidth > width;
        const shouldBreak = requiredBreakAfter || exceedsWidth;

        if (required) {
          requiredBreakAfter = true;
        } else {
          requiredBreakAfter = false;
        }

        if (shouldBreak) {
          lines.push({
            // Remove trailing whitespace
            text: line.trimEnd() + (hasHyphenationOpportunity ? '\u002D' : ''),
            x: getLineStartX(width, lastLineWidth, align),
            y: yOff,
          });

          line = word.trimStart();

          yOff += lh * fontSize;
          curHeight = fontSize + yOff;
          lastLineWidth = this.getAdvanceWidth(line, options);
          hasHyphenationOpportunity = false;

          if (height && curHeight > height) {
            canFitNextLine = false;
            break;
          }
        } else {
          line = nextLine;
          lastLineWidth = lineWidth;
          hasHyphenationOpportunity = canHyphenate;
        }

        last = position;
      }

      if (canFitNextLine && line) {
        lines.push({
          text: line.trimEnd(),
          x: getLineStartX(width, lastLineWidth, align),
          y: yOff,
        });
      }

      return lines;
    },
  };
};
