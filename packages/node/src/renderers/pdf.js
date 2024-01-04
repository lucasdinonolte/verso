import PDFDocument from 'pdfkit';

import { registerRenderer } from '@verso/core';

import WritableBufferStream from '../util/bufferStream.js';
import { parseFonts } from '../util/fonts.js';

const createState = (initialValue) => {
  let value = initialValue;
  return {
    get: () => value,
    set: (newValue) => (value = newValue),
  };
};

const applyStylesToElement = (element, styles) => {
  const { fill, stroke, strokeWidth } = styles;
  if (fill) {
    element.fillColor(fill).fill();
  }

  if (stroke) {
    element.lineWidth(strokeWidth ?? 1).stroke(stroke);
  }

  return element;
};

export const renderToPDF = registerRenderer({
  init(_, { fonts = [] } = {}) {
    const findFont = parseFonts(fonts);
    const doc = createState(null);
    const registeredFonts = createState([]);

    const currentElement = createState(null);
    const stream = new WritableBufferStream();

    return {
      findFont,
      doc,
      currentElement,
      stream,
      registeredFonts,
    };
  },
  setup({ width, height }, { doc, stream }) {
    doc.set(
      new PDFDocument({
        size: [width, height],
      })
    );
    doc.get().pipe(stream);
  },
  /*
  text(
    {
      align,
      lines,
      fontFamily,
      fontSize,
      lineHeight,
      letterSpacing,
      x,
      y,
      width,
      height,
      style,
    },
    { doc, registeredFonts }
  ) {
    if (!registeredFonts.get().includes(fontFamily.name)) {
      doc.get().registerFont(fontFamily.name, fontFamily.buffer);
      registeredFonts.set([...registeredFonts.get(), fontFamily.name]);
    }

    const text = lines.map((l) => l.text).join('\n');

    doc.get().fontSize(fontSize);
    applyStylesToElement(doc.get().font(fontFamily.name), style).text(
      text,
      x,
      y,
      {
        align,
        width,
        height,
        lineGap: (lineHeight ?? fontSize) - fontSize,
        characterSpacing: letterSpacing,
      }
    );
  },
  */
  beginPath() { },
  endPath() { },
  transform({ a, b, c, d, tx, ty }, { doc }) {
    doc.get().transform(a, b, c, d, tx, ty);
  },
  moveTo(x, y, { doc, currentElement }) {
    currentElement.set(doc.get().moveTo(x, y));
  },
  lineTo(x, y, { currentElement }) {
    currentElement.get().lineTo(x, y);
  },
  curveTo(x1, y1, x2, y2, x3, y3, { currentElement }) {
    currentElement.get().bezierCurveTo(x1, y1, x2, y2, x3, y3);
  },
  close({ currentElement }) {
    currentElement.get().closePath();
  },
  applyStyles(styles, { currentElement }) {
    applyStylesToElement(currentElement.get(), styles);
  },
  export: ({ stream, doc }) =>
    new Promise((res) => {
      stream.on('finish', () => {
        res({
          mimeType: 'application/pdf',
          extension: 'pdf',
          data: stream.toBuffer(),
        });
      });

      doc.get().end();
    }),
});
