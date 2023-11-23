import { SVG } from '@svgdotjs/svg.js';
import { renderNodeWithRenderer } from '@verso/core';

import { parseFonts } from './util/fonts.js';

export const renderToSVG = (root, node, { fonts = [] } = {}) => {
  const findFont = parseFonts(fonts);
  const svgRoot = SVG().addTo(node);

  let pathCommands = [];
  let curEl = null;

  const renderer = {
    setup({ width, height }) {
      svgRoot.size(width, height);
    },
    text(text, x, y, { fontSize, fontFamily } = {}) {
      const font = findFont(fontFamily);
      curEl = svgRoot.path(
        font.data.getPath(text, x, y, fontSize).toDataPath()
      );
    },
    beginPath() {
      pathCommands = [];
      curEl = null;
    },
    endPath() {
      curEl = svgRoot.path(pathCommands.join(' '));
    },
    moveTo(x, y) {
      pathCommands.push(`M${x} ${y}`);
    },
    lineTo(x, y) {
      pathCommands.push(`L${x} ${y}`);
    },
    curveTo(x1, y1, x2, y2, x3, y3) {
      pathCommands.push(`C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`);
    },
    close() {
      pathCommands.push(`Z`);
    },
    applyStyles({ fill, stroke, strokeWidth } = {}) {
      if (!curEl) return;

      if (fill) {
        curEl.fill(fill ?? 'none');
      }

      if (stroke) {
        curEl.stroke(stroke ?? 'none');
        curEl.attr('stroke-width', strokeWidth ?? 1);
      }
    },
  };

  renderNodeWithRenderer(root, renderer);

  return {
    export: () => ({
      extension: 'svg',
      mimeType: 'image/svg+xml',
      data: svgRoot.svg(),
    }),
  };
};
