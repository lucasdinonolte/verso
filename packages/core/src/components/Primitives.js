import { KAPPA, moveTo, lineTo, close } from '../path.js';
import { Path } from './Path.js';

/**
 * @param {{ x: number, y: number, width: number, height: number, style: object }}
 *
 * @example
 * <Rectangle x={0} y={0} width={100} height={100} />
 */
export const Rectangle = ({ x, y, width, height, style }, renderer) => {
  const path = [
    moveTo(x, y),
    lineTo(x + width, y),
    lineTo(x + width, y + height),
    lineTo(x, y + height),
    close(),
  ];

  return Path({ path, style }, renderer);
};

/**
 * @param {{ cx: number, cy: number, rx: number, ry: number, style: object }}
 *
 * @example
 * <Ellipse cx={0} cy={0} rx={100} ry={50} />
 */
export const Ellipse = ({ cx, cy, rx, ry, style }, renderer) => {
  const path = [
    moveTo(cx + rx, cy),
    curveTo(cx + rx, cy - ry * KAPPA, cx + rx * KAPPA, cy - ry, cx, cy - ry),
    curveTo(cx - rx * KAPPA, cy - ry, cx - rx, cy - ry * KAPPA, cx - rx, cy),
    curveTo(cx - rx, cy + ry * KAPPA, cx - rx * KAPPA, cy + ry, cx, cy + ry),
    curveTo(cx + rx * KAPPA, cy + ry, cx + rx, cy + ry * KAPPA, cx + rx, cy),
    close(),
  ];
  return Path({ path, style }, renderer);
};

/**
 * @param {{ cx: number, cy: number, r: number, style: object }}
 *
 * @example
 * <Circle cx={0} cy={0} r={100} />
 */
export const Circle = ({ cx, cy, r, ...rest }, renderer) =>
  Ellipse(
    {
      cx,
      cy,
      rx: r,
      ry: r,
      ...rest,
    },
    renderer
  );

/**
 * @param {{ cx: number, cy: number, r: number, sides: number, style: object }}
 *
 * @example
 * <Polygon cx={0} cy={0} r={100} sides={3} />
 */
export const Polygon = ({ cx, cy, r, sides, style }, renderer) => {
  const edges = Math.max(sides, 3);
  const angle = (Math.PI * 2) / edges;
  const points = [];
  for (let i = 0; i < edges; i++) {
    const a = angle * i;
    points.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }

  const path = [
    moveTo(points[0].x, points[0].y),
    ...points.slice(1).map((p) => lineTo(p.x, p.y)),
    close(),
  ];

  return Path({ path, style }, renderer);
};

/**
 * @param {{ from: { x: number, y: number }, to: { x: number, y: number }, style: object }}
 *
 * @example
 * <Line from={{ x: 0, y: 0 }} to={{ x: 100, y: 100}} />
 */
export const Line = ({ from, to, style }, renderer) => {
  const path = [moveTo(from.x, from.y), lineTo(to.x, to.y)];
  return Path({ path, style }, renderer);
};
