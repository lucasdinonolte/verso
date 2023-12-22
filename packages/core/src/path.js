import createAnchor from './anchor.js';
import createCurve from './curve.js';
import createPoint from './point.js';
import { parseSVGPath } from './svgPath.js';

const KAPPA = 0.5522847498;

/**
 * @typedef {Object} Path
 * @property {"path"} type
 * @property {Anchor[]} anchors
 */

/**
 * typedef {Object} PathCommand
 * @property {"moveTo"|"lineTo"|"curveTo"|"close"} type
 * @property {number[]} data
 */

/**
 * @param {number} x
 * @param {number} y
 * @returns {PathCommand}
 */
export const moveTo = (x, y) => ({
  type: 'moveTo',
  data: [x, y],
});

/**
 * @param {number} x
 * @param {number} y
 * @returns {PathCommand}
 */
export const lineTo = (x, y) => ({
  type: 'lineTo',
  data: [x, y],
});

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} x3
 * @param {number} y3
 * @returns {PathCommand}
 */
export const curveTo = (x1, y1, x2, y2, x3, y3) => ({
  type: 'curveTo',
  data: [x1, y1, x2, y2, x3, y3],
});

/**
 * @returns {PathCommand}
 */
export const close = () => ({
  type: 'close',
});

/**
 * Computes curves for a path.
 *
 * @param {Anchor[]} anchors
 * @param {boolean} closed
 * @returns {Curve[]}
 */
const computeCurves = (anchors, closed) => {
  const res = [];

  for (let i = 0; i < anchors.length - 1; i++) {
    const a1 = anchors[i],
      a2 = anchors[i + 1];

    res.push(createCurve(a1, a2));
  }

  // For a closed path connect the last and first anchor
  // with a curve.
  if (closed) {
    res.push(createCurve(anchors[anchors.length - 1], anchors[0]));
  }

  return res;
};

const makePath = (anchors, closed) => {
  const curves = computeCurves(anchors, closed);
  const length = curves.reduce((acc, curve) => acc + curve.length(), 0);

  const locationAt = (t) => {
    let offset = length * t,
      c = curves,
      l = 0;

    for (let i = 0; i < c.length; i++) {
      const start = l,
        curve = c[i],
        cl = curve.length();

      l += cl;
      if (l > offset) {
        return {
          curve,
          location: offset - start,
          t: (offset - start) / cl,
        };
      }
    }

    return {
      curve: c[c.length - 1],
      location: c[c.length - 1].length(),
      t: 1,
    };
  };

  return {
    type: 'path',
    anchors,
    closed,
    curves,
    length,
    getPointAt(t) {
      const cl = locationAt(t);
      return cl.curve.getPointAt(cl.t);
    },
    getTangentAt(t) {
      const cl = locationAt(t);
      return cl.curve.getTangentAt(cl.t);
    },
    getNormalAt(t) {
      const cl = locationAt(t);
      return cl.curve.getNormalAt(cl.t);
    },
    getCurvatureAt(t) {
      const cl = locationAt(t);
      return cl.curve.getCurvatureAt(cl.t);
    },
    getRadiusAt(t) {
      const cl = locationAt(t);
      return cl.curve.getRadiusAt(cl.t);
    },
    toStraightened() {
      const anchors = this.anchors.map((anchor) => anchor.removeHandles());
      return makePath(anchors, this.closed);
    },
    toReversed() {
      const anchors = this.anchors.slice().reverse();
      for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i],
          handleIn = anchor.handleIn;

        anchor.handleIn = anchor.handleOut;
        anchor.handleOut = handleIn;
      }

      return makePath(anchors, this.closed);
    },
    toInstructions() {
      const s = [];
      const p = this.anchors[0].point;
      s.push(moveTo(p.x, p.y));

      for (let i = 0; i < this.curves.length; i++) {
        const c = this.curves[i];
        s.push(c.toInstruction());
      }

      if (this.closed) {
        s.push(close());
      }

      return s;
    },
  };
};

export const createRectanglePath = ({ x, y, width, height }) => {
  return createPath(
    moveTo(x, y),
    lineTo(x + width, y),
    lineTo(x + width, y + height),
    lineTo(x, y + height),
    close()
  );
};

export const createEllipsePath = ({ cx, cy, rx, ry }) => {
  return createPath(
    moveTo(cx + rx, cy),
    curveTo(cx + rx, cy - ry * KAPPA, cx + rx * KAPPA, cy - ry, cx, cy - ry),
    curveTo(cx - rx * KAPPA, cy - ry, cx - rx, cy - ry * KAPPA, cx - rx, cy),
    curveTo(cx - rx, cy + ry * KAPPA, cx - rx * KAPPA, cy + ry, cx, cy + ry),
    curveTo(cx + rx * KAPPA, cy + ry, cx + rx, cy + ry * KAPPA, cx + rx, cy),
    close()
  );
};

export const createCirclePath = ({ cx, cy, r }) =>
  createEllipsePath({ cx, cy, rx: r, ry: r });

/**
 * Creates a new path.
 *
 * @param {string|Array} path
 * @returns {Path}
 */
const createPath = (...args) => {
  const hasSVGPath = typeof args[0] === 'string';
  const commands = hasSVGPath ? parseSVGPath(args[0]) : args;

  let closed = false;

  const anchors = commands.reduce((acc, command) => {
    let item;
    switch (command.type) {
      case 'moveTo': {
        const point = createPoint(...command.data);
        item = createAnchor(point, null, null);
        return [...acc, item];
      }
      case 'lineTo': {
        const point = createPoint(...command.data);
        item = createAnchor(point, null, null);
        return [...acc, item];
      }
      case 'curveTo': {
        const [x1, y1, x2, y2, x3, y3] = command.data;
        const point = createPoint(x3, y3),
          handleOut = createPoint(x1, y1),
          handleIn = createPoint(x2, y2);

        acc[acc.length - 1].handleOut = handleOut;
        item = createAnchor(point, handleIn, null);

        return [...acc, item];
      }
      case 'close': {
        closed = true;
        return acc;
      }
    }
  }, []);

  return makePath(anchors, closed);
};

export default createPath;
