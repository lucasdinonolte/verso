import { registerRenderer } from '@verso/core';
import { parseFonts } from './util/fonts.js';

export const renderToCanvas = registerRenderer({
  init(_, canvas, { fonts = [] } = {}) {
    const ctx = canvas.getContext('2d');
    const findFont = parseFonts(fonts);
    const settings = {};

    return { canvas, ctx, findFont, settings };
  },
  setup({ width, height, density }, { canvas, ctx, settings }) {
    canvas.width = width * density;
    canvas.height = height * density;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    settings.density = density;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(density, density);
  },
  text(text, x, y, { fontSize, fontFamily } = {}, { ctx, findFont }) {
    const font = findFont(fontFamily);
    font.data.draw(ctx, text, x, y, fontSize);
  },
  beginPath({ ctx }) {
    ctx.beginPath();
  },
  endPath() {
    /* NOOP */
  },
  transform({ a, b, c, d, tx, ty }, { ctx }) {
    ctx.transform(a, b, c, d, tx, ty);
  },
  moveTo(x, y, { ctx }) {
    ctx.moveTo(x, y);
  },
  lineTo(x, y, { ctx }) {
    ctx.lineTo(x, y);
  },
  curveTo(x1, y1, x2, y2, x3, y3, { ctx }) {
    ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
  },
  close({ ctx }) {
    ctx.closePath();
  },
  applyStyles({ fill, stroke, strokeWidth } = {}, { ctx }) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth ?? 1;
      ctx.stroke();
    }
  },
  export: ({ canvas }) => ({
    extension: 'png',
    mimeType: 'image/png',
    data: canvas.toDataURL('image/png'),
  }),
});
