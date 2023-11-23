const point = (x, y) => ({
  type: 'Point',
  x,
  y,
  length: Math.sqrt(x * x + y * y),
  add(otherPoint) {
    return point(x + otherPoint.x, y + otherPoint.y);
  },
  sub(otherPoint) {
    return point(x - otherPoint.x, y - otherPoint.y);
  },
  multiply(scalar) {
    return point(x * scalar, y * scalar);
  },
  divide(scalar) {
    return point(x / scalar, y / scalar);
  },
  normalize() {
    return this.divide(this.length);
  },
});

export default point;
