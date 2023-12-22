import { radiansToDegrees, degreesToRadians } from './utils.js';

/**
 * @typedef {Object} Point
 * @property {"point"} type
 * @property {number} x x coordinate of the Point
 * @property {number} y y coordinate of the Point
 * @property {(point: { x?: number, y?: number }) => void} set
 *
 * @property {(point: Point) => Point} add
 * Adds another point to this point, returns a new point
 *
 * @property {(point: Point) => Point} subtract
 * Subtracts another point from this point, returns a new point
 *
 * @property {(scalar: number) => Point} multiply
 * Multiplies point with a scalar value, returns a new point
 *
 * @property {(point: Point) => number} dot
 * Computes the dot product of two points
 *
 * @property {(scalar: number) => Point} divide
 * Divides a point with a scalar value, returns a new point
 *
 * @property {(point: Point) => number} distance
 * Computes the distance between this point and another point
 *
 * @property {() => number} length
 * Computes the length of this point. Origin is 0,0
 *
 * @property {() => Point} normalize
 * Normalization modifies the length of the point to be 1 without changing the points
 * direction or angle. Returns a new point.
 *
 * @property {(max: number) => Point} limit
 * Limits the length of a point to a given maxiumum. Returns a new point.
 *
 * @property {() => number} rotation
 * Returns the angle of this point in relation to the x-axis in degrees.
 *
 * @property {(point: Point) => number} angle
 * Returns the angle between two points.
 *
 * @property {(angle: number) => Point} rotate
 * Creates a new point by rotation this point by an angle specified in degrees around 0,0.
 *
 * @property {() => boolean} isZero
 * Returns true if the point is 0,0
 *
 * @property {() => Point} copy
 * Creates a copy of this point.
 *
 * @property {() => string} toString
 */

/**
 * Creates a new point.
 *
 * @param {number} x
 * @param {number} y
 * @returns {Point}
 */
const createPoint = (x = 0, y = 0) => ({
  type: 'point',
  x,
  y,
  set({ x, y } = {}) {
    if (x) this.x = x;
    if (y) this.y = y;
  },
  add({ x = 0, y = 0 } = {}) {
    return createPoint(this.x + x, this.y + y);
  },
  subtract({ x = 0, y = 0 } = {}) {
    return createPoint(this.x - x, this.y - y);
  },
  multiply(scalar) {
    return createPoint(this.x * scalar, this.y * scalar);
  },
  dot({ x = 0, y = 0 } = {}) {
    return this.x * x + this.y * y;
  },
  divide(scalar) {
    return createPoint(this.x / scalar, this.y / scalar);
  },
  distance({ x = 0, y = 0 } = {}) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  length() {
    const lenSq = this.x * this.x + this.y * this.y;
    return Math.sqrt(lenSq);
  },
  normalize() {
    const len = this.length();
    return this.divide(len);
  },
  limit(max) {
    const lenSq = this.x * this.x + this.y * this.y;
    if (lenSq > max * max) {
      return this.divide(Math.sqrt(lenSq)).multiply(max);
    }
    return this.copy();
  },
  rotation() {
    return radiansToDegrees(Math.atan2(this.y, this.x));
  },
  angle(point) {
    const div = this.length() * point.length();
    const a = this.dot(point) / div;
    return radiansToDegrees(Math.acos(a < -1 ? -1 : a > 1 ? 1 : a));
  },
  rotate(_angle = 0) {
    const angle = degreesToRadians(_angle);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.y * sin - this.y * cos;
    return createPoint(x, y);
  },
  isZero() {
    return this.x === 0 && this.y === 0;
  },
  copy() {
    return createPoint(this.x, this.y);
  },
  toString() {
    return `(${this.x}, ${this.y})`;
  },
});

export default createPoint;
