export const polarToCartesian = (cx, cy, r, angle) => {
  const a = ((angle - 90) * Math.PI) / 180.0;

  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
};
