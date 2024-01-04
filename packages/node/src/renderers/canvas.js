import { createCanvas } from 'canvas';

import { registerRenderer } from '@verso/core';
import { parseFonts } from '../util/fonts.js';

const createState = (initialValue) => {
  let value = initialValue;
  return {
    get: () => value,
    set: (newValue) => (value = newValue),
  };
};

export const renderToCanvas = registerRenderer({
  init(_, { fonts = [] } = {}) {
    const canvas = createState(null);
    const ctx = createState(null);
    const findFont = parseFonts(fonts);

    return { canvas, ctx, findFont };
  },
  setup({ width, height, density }, { canvas, ctx }) {
    const canvasEl = createCanvas(width * density, height * density);
    canvas.set(canvasEl);

    const ctx2D = canvasEl.getContext('2d');
    ctx.set(ctx2D);

    ctx2D.clearRect(0, 0, width, height);
    ctx2D.scale(density, density);
  },
  beginPath({ ctx }) {
    ctx.get().beginPath();
  },
  endPath() {
    /* NOOP */
  },
  transform({ a, b, c, d, tx, ty }, { ctx }) {
    ctx.get().transform(a, b, c, d, tx, ty);
  },
  moveTo(x, y, { ctx }) {
    ctx.get().moveTo(x, y);
  },
  lineTo(x, y, { ctx }) {
    ctx.get().lineTo(x, y);
  },
  curveTo(x1, y1, x2, y2, x3, y3, { ctx }) {
    ctx.get().bezierCurveTo(x1, y1, x2, y2, x3, y3);
  },
  close({ ctx }) {
    ctx.get().closePath();
  },
  applyStyles({ fill, stroke, strokeWidth } = {}, { ctx }) {
    if (fill) {
      ctx.get().fillStyle = fill;
      ctx.get().fill();
    }

    if (stroke) {
      ctx.get().strokeStyle = stroke;
      ctx.get().lineWidth = strokeWidth ?? 1;
      ctx.get().stroke();
    }
  },
  export: (mimeType = 'image/png', { canvas }) => {
    const extensions = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
    };

    if (!extensions[mimeType]) {
      throw new Error(`Unsupported export format "${mimeType}"`);
    }

    return {
      extension: extensions[mimeType],
      mimeType: mimeType,
      data: canvas.get().toBuffer(mimeType),
    };
  },
});
