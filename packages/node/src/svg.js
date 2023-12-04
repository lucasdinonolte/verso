import { createSVGWindow } from 'svgdom';
import { SVG, registerWindow } from '@svgdotjs/svg.js';
import {
  appendTransformationMatrix,
  identityMatrix,
  isIdentityMatrix,
  registerRenderer,
} from '@verso/core';

import { parseFonts } from './util/fonts.js';

const createState = (initialValue) => {
  let value = initialValue;
  return {
    get: () => value,
    set: (newValue) => (value = newValue),
  };
};

export const renderToSVG = registerRenderer(
  {
    init(_, { fonts = [] } = {}) {
      const window = createSVGWindow();
      const document = window.document;
      registerWindow(window, document);

      const findFont = parseFonts(fonts);
      const svgRoot = SVG(document.documentElement);

      const currentPath = createState([]);
      const currentElement = createState(null);
      const currentTransform = createState(identityMatrix);

      return {
        svgRoot,
        findFont,
        currentPath,
        currentElement,
        currentTransform,
      };
    },
    setup({ width, height }, { svgRoot }) {
      svgRoot.size(width, height);
    },
    text(
      text,
      x,
      y,
      { fontSize, fontFamily } = {},
      { svgRoot, findFont, currentElement }
    ) {
      const font = findFont(fontFamily);
      currentElement.set(
        svgRoot.path(font.data.getPath(text, x, y, fontSize).toDataPath())
      );
    },
    transform(matrix, { currentTransform }) {
      currentTransform.set(
        appendTransformationMatrix(currentTransform.get(), matrix)
      );
    },
    beginPath({ currentElement, currentPath }) {
      currentPath.set([]);
      currentElement.set(null);
    },
    endPath({ currentPath, currentElement, currentTransform, svgRoot }) {
      const pathCommands = currentPath.get();
      currentElement.set(svgRoot.path(pathCommands.join(' ')));

      const transform = currentTransform.get();
      if (!isIdentityMatrix(transform)) {
        currentElement.get().transform({
          a: transform.a,
          b: transform.b,
          c: transform.c,
          d: transform.d,
          e: transform.tx,
          f: transform.ty,
        });
      }
    },
    moveTo(x, y, { currentPath }) {
      currentPath.set([...currentPath.get(), `M${x} ${y}`]);
    },
    lineTo(x, y, { currentPath }) {
      currentPath.set([...currentPath.get(), `L${x} ${y}`]);
    },
    curveTo(x1, y1, x2, y2, x3, y3, { currentPath }) {
      currentPath.set([
        ...currentPath.get(),
        `C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`,
      ]);
    },
    close({ currentPath }) {
      currentPath.set([...currentPath.get(), 'Z']);
    },
    applyStyles({ fill, stroke, strokeWidth } = {}, { currentElement }) {
      const curEl = currentElement.get();
      if (!curEl) return;

      if (fill) {
        curEl.fill(fill ?? 'none');
      }

      if (stroke) {
        curEl.stroke(stroke ?? 'none');
        curEl.attr('stroke-width', strokeWidth ?? 1);
      }
    },
    export(_, { svgRoot }) {
      return {
        mimeType: 'image/svg+xml',
        data: svgRoot.svg(),
      };
    },
  },
  {
    extensions: {
      svg: 'image/svg+xml',
    },
  }
);
