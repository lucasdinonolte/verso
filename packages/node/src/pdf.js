import PDFDocument from 'pdfkit';

import {
  appendTransformationMatrix,
  identityMatrix,
  isIdentityMatrix,
  registerRenderer,
} from '@verso/core';

import WritableBufferStream from './util/bufferStream.js';
import { parseFonts } from './util/fonts.js';

const createState = (initialValue) => {
  let value = initialValue;
  return {
    get: () => value,
    set: (newValue) => (value = newValue),
  };
};

export const renderToPDF = registerRenderer(
  {
    init(_, { fonts = [] } = {}) {
      const findFont = parseFonts(fonts);
      const doc = createState(null);
      const currentElement = createState(null);
      const stream = new WritableBufferStream();

      return {
        findFont,
        doc,
        currentElement,
        stream,
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
    text() { },
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
    applyStyles({ fill, stroke, strokeWidth } = {}, { currentElement }) {
      if (fill) {
        currentElement.get().fill(fill);
      }

      if (stroke) {
        currentElement
          .get()
          .lineWidth(strokeWidth ?? 1)
          .stroke(stroke);
      }
    },
    export: (mimeType, { stream, doc }) =>
      new Promise((res) => {
        stream.on('finish', () => {
          res({
            mimeType,
            buffer: stream.toBuffer(),
          });
        });

        doc.get().end();
      }),
  },
  {
    extensions: {
      pdf: 'application/pdf',
    },
  }
);
