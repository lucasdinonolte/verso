import { SVG } from '@svgdotjs/svg.js';
import {
  appendTransformationMatrix,
  identityMatrix,
  isIdentityMatrix,
  registerRenderer,
} from '@verso/core';

import { parseFonts } from '../util/fonts.js';

const createState = (initialValue) => {
  let value = initialValue;
  return {
    get: () => value,
    set: (newValue) => (value = newValue),
  };
};

export const renderToSVG = registerRenderer({
  init(_, node, { fonts = [] } = {}) {
    node.replaceChildren();

    const findFont = parseFonts(fonts);
    const svgRoot = SVG().addTo(node);

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
  setup({ width, height }) {
    svgRoot.size(width, height);
  },
  setup({ width, height }, { svgRoot }) {
    svgRoot.size(width, height);
  },
  image(
    { image, x, y, width: _width, height: _height },
    { svgRoot, currentTransform }
  ) {
    const ratio = image.width / image.height;
    const width = _width ? _width : _height ? _height * ratio : image.width;
    const height = _height ? _height : _width ? _width / ratio : image.height;

    const imgEl = svgRoot
      .image(image.toDataURL())
      .move(x, y)
      .size(width, height);

    const transform = currentTransform.get();
    if (!isIdentityMatrix(transform)) {
      imgEl.transform({
        a: transform.a,
        b: transform.b,
        c: transform.c,
        d: transform.d,
        e: transform.tx,
        f: transform.ty,
      });
    }
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
  export({ svgRoot }) {
    return {
      extension: 'svg',
      mimeType: 'image/svg+xml',
      data: svgRoot.svg(),
    };
  },
});
