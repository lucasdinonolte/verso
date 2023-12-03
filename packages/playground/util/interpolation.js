export const interpolate = (a, b, t) => {
  return a + (b - a) * t;
};

export const wrapInterpolate = (a, b, t) => {
  return interpolate(a, b, t % 1);
};
