export const KAPPA = 0.5522847498;

const computePolygonPoints = (radius, count, { x, y }) => {
  const edges = Math.max(count, 3);
  const angle = (Math.PI * 2) / edges;
  const points = [];
  for (let i = 0; i < edges; i++) {
    const a = angle * i;
    points.push({ x: x + radius * Math.cos(a), y: y + radius * Math.sin(a) });
  }

  return points;
};

/**
 * @param {{ x: number, y: number, width: number, height: number, style: object }}
 *
 * @example
 * <Rectangle x={0} y={0} width={100} height={100} />
 */
export const Rectangle = ({ x, y, width, height, style }, renderer) => {
  renderer.beginPath();
  renderer.moveTo(x, y);
  renderer.lineTo(x + width, y);
  renderer.lineTo(x + width, y + height);
  renderer.lineTo(x, y + height);
  renderer.lineTo(x, y);
  renderer.close();
  renderer.endPath();
  renderer.applyStyles(style);
};

export const Ellipse = ({ cx, cy, rx, ry, style }, renderer) => {
  renderer.beginPath();
  renderer.moveTo(cx + rx, cy);
  renderer.curveTo(
    cx + rx,
    cy - ry * KAPPA,
    cx + rx * KAPPA,
    cy - ry,
    cx,
    cy - ry
  );
  renderer.curveTo(
    cx - rx * KAPPA,
    cy - ry,
    cx - rx,
    cy - ry * KAPPA,
    cx - rx,
    cy
  );
  renderer.curveTo(
    cx - rx,
    cy + ry * KAPPA,
    cx - rx * KAPPA,
    cy + ry,
    cx,
    cy + ry
  );
  renderer.curveTo(
    cx + rx * KAPPA,
    cy + ry,
    cx + rx,
    cy + ry * KAPPA,
    cx + rx,
    cy
  );
  renderer.close();
  renderer.endPath();
  renderer.applyStyles(style);
};

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

export const Polygon = ({ cx, cy, r, sides, style }, renderer) => {
  const points = computePolygonPoints(r, sides, { x: cx, y: cy });
  renderer.beginPath();
  renderer.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((p) => renderer.lineTo(p.x, p.y));
  renderer.close();
  renderer.endPath();
  renderer.applyStyles(style);
};

export const Line = ({ from, to, style }, renderer) => {
  renderer.beginPath();
  renderer.moveTo(from.x, from.y);
  renderer.lineTo(to.x, to.y);
  renderer.endPath();
  renderer.applyStyles(style);
};
