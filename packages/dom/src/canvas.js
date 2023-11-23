import { renderNodeWithRenderer } from '@verso/core';

import { parseFonts } from './util/fonts.js';

export const renderToCanvas = (root, node, { fonts = [] } = {}) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  node.appendChild(canvas);

  const findFont = parseFonts(fonts);

  const renderer = {
    setup({ width, height, density }) {
      canvas.width = width * density;
      canvas.height = height * density;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(density, density);
    },
    text(text, x, y, { fontSize, fontFamily } = {}) {
      const font = findFont(fontFamily);
      font.data.draw(ctx, text, x, y, fontSize);
    },
    beginPath() {
      ctx.beginPath();
    },
    endPath() {
      /* NOOP */
    },
    moveTo(x, y) {
      ctx.moveTo(x, y);
    },
    lineTo(x, y) {
      ctx.lineTo(x, y);
    },
    curveTo(x1, y1, x2, y2, x3, y3) {
      ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
    },
    close() {
      ctx.closePath();
    },
    applyStyles({ fill, stroke, strokeWidth } = {}) {
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
  };

  renderNodeWithRenderer(root, renderer);

  return {
    export: () => ({
      extension: 'png',
      mimeType: 'image/png',
      data: canvas.toDataURL('image/png'),
    }),
  };
};
