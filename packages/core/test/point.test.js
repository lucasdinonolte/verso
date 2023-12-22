import { describe, expect, it } from 'vitest';

import createPoint from '../src/point.js';

describe('point', () => {
  it('should create a point', () => {
    const point = createPoint(1, 2);
    expect(point.x).toBe(1);
    expect(point.y).toBe(2);
  });

  it('should add points', () => {
    const point1 = createPoint(10, 20);
    const point2 = createPoint(30, 50);
    const res = point1.add(point2);

    expect(res.x).toBe(40);
    expect(res.y).toBe(70);
  });

  it('should add points', () => {
    const point1 = createPoint(10, 20);
    const point2 = createPoint(30, 50);
    const res = point1.subtract(point2);

    expect(res.x).toBe(-20);
    expect(res.y).toBe(-30);
  });

  it('should multiply a point with a scalar value', () => {
    const point = createPoint(10, 20);
    const res = point.multiply(2);

    expect(res.x).toBe(20);
    expect(res.y).toBe(40);
  });

  it('should compute the dot product of two points', () => {
    const point1 = createPoint(10, 20);
    const point2 = createPoint(30, 50);

    const res = point1.dot(point2);

    expect(res).toBe(1300);
  });

  it('should divide a point with a scalar value', () => {
    const point = createPoint(10, 20);
    const res = point.divide(2);

    expect(res.x).toBe(5);
    expect(res.y).toBe(10);
  });

  it('should calculate the length of a point', () => {
    const point = createPoint(10, 15);
    const res = point.length();
    expect(res).toEqual(18.027756377319946);
  });

  it('should find the distance between two points', () => {
    const point1 = createPoint(10, 15);
    const point2 = createPoint(20, 25);

    const res = point1.distance(point2);

    expect(res).toEqual(14.142135623730951);
  });

  it('should normalize a point', () => {
    const point = createPoint(10, 15);
    const res = point.normalize();

    expect(res.x).toEqual(0.5547001962252291);
    expect(res.y).toEqual(0.8320502943378437);
  });

  it('should limit a point’s length', () => {
    const point = createPoint(10, 10);
    const res = point.limit(5);

    expect(res.x).toEqual(3.5355339059327373);
    expect(res.y).toEqual(3.5355339059327373);
  });

  it('should get the rotation of a point', () => {
    const point = createPoint(10, 10);
    const res = point.rotation();
    expect(res).toEqual(45);
  });

  it('should get the angle between two points', () => {
    const point1 = createPoint(10, 10);
    const point2 = createPoint(20, 20);

    const res = point1.angle(point2);
    expect(res).toBeCloseTo(0);
  });

  it('should rotate a point', () => {
    const point = createPoint(10, 10);
    const res = point.rotate(90);
    expect(res.x).toBe(-10);
    expect(res.y).toBe(10);
  });

  it('should copy a point', () => {
    const point = createPoint(10, 10);
    const res = point.copy();

    expect(res.x).toBe(point.x);
    expect(res.y).toBe(point.y);
    expect(res).not.toBe(point);
  });
});
