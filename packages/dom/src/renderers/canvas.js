import { registerRenderer } from '@verso/core';
import { parseFonts } from '../util/fonts.js';

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
  image({ image, x, y, width: _width, height: _height }, { ctx }) {
    const ratio = image.width / image.height;

    const width = _width ? _width : _height ? _height * ratio : image.width;
    const height = _height ? _height : _width ? _width / ratio : image.height;

    ctx.drawImage(image.toImageCanvas(), x, y, width, height);
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
      data: canvas.toDataURL(mimeType),
    };
  },
});
