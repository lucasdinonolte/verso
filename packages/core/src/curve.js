// Inspired by rune.js and paper.js
// which are based on bezier.js
import createPoint from './point.js';
import { lineTo, curveTo } from './path.js';

/**
 *  Legendre-Gauss abscissae with n=24 (x_i values, defined at i=n as
 *  the roots of the nth order Legendre polynomial Pn(x))
 */
const T_VALUES = [
  -0.0640568928626056260850430826247450385909,
  0.0640568928626056260850430826247450385909,
  -0.1911188674736163091586398207570696318404,
  0.1911188674736163091586398207570696318404,
  -0.3150426796961633743867932913198102407864,
  0.3150426796961633743867932913198102407864,
  -0.4337935076260451384870842319133497124524,
  0.4337935076260451384870842319133497124524,
  -0.5454214713888395356583756172183723700107,
  0.5454214713888395356583756172183723700107,
  -0.6480936519369755692524957869107476266696,
  0.6480936519369755692524957869107476266696,
  -0.7401241915785543642438281030999784255232,
  0.7401241915785543642438281030999784255232,
  -0.8200019859739029219539498726697452080761,
  0.8200019859739029219539498726697452080761,
  -0.8864155270044010342131543419821967550873,
  0.8864155270044010342131543419821967550873,
  -0.9382745520027327585236490017087214496548,
  0.9382745520027327585236490017087214496548,
  -0.9747285559713094981983919930081690617411,
  0.9747285559713094981983919930081690617411,
  -0.9951872199970213601799974097007368118745,
  0.9951872199970213601799974097007368118745,
];

/**
 * Legendre-Gauss weights with n=24 (w_i values, defined by a function
 * linked to in the Bezier primer article)
 */
const C_VALUES = [
  0.1279381953467521569740561652246953718517,
  0.1279381953467521569740561652246953718517,
  0.1258374563468282961213753825111836887264,
  0.1258374563468282961213753825111836887264,
  0.121670472927803391204463153476262425607,
  0.121670472927803391204463153476262425607,
  0.1155056680537256013533444839067835598622,
  0.1155056680537256013533444839067835598622,
  0.1074442701159656347825773424466062227946,
  0.1074442701159656347825773424466062227946,
  0.0976186521041138882698806644642471544279,
  0.0976186521041138882698806644642471544279,
  0.086190161531953275917185202983742667185,
  0.086190161531953275917185202983742667185,
  0.0733464814110803057340336152531165181193,
  0.0733464814110803057340336152531165181193,
  0.0592985849154367807463677585001085845412,
  0.0592985849154367807463677585001085845412,
  0.0442774388174198061686027482113382288593,
  0.0442774388174198061686027482113382288593,
  0.0285313886289336631813078159518782864491,
  0.0285313886289336631813078159518782864491,
  0.0123412297999871995468056670700372915759,
  0.0123412297999871995468056670700372915759,
];

/**
 * @typedef {Object} Curve
 * @property {"curve"} type
 * @property {Point[]} points
 * @property {number} degree
 */

/**
 * Creates a lookup table for a derived curve function
 *
 * @param {Point[]} points
 * @returns {Point[]}
 */
const deriveCurve = (points) => {
  const res = [];

  for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
    const list = [];
    for (let j = 0, dpt; j < c; j++) {
      dpt = {
        x: c * (p[j + 1].x - p[j].x),
        y: c * (p[j + 1].y - p[j].y),
      };
      list.push(createPoint(dpt.x, dpt.y));
    }
    res.push(list);
    p = list;
  }

  return res;
};

/**
 * Computes a point on a curve given a t value between 0 and 1.
 *
 * @param {number} t
 * @param {Point[]} points
 * @returns {Point}
 */
const computePointOnCurve = (t, points) => {
  if (t === 0) return points[0];
  const degree = points.length - 1;
  if (t === 1) return points[degree];
  if (degree === 0) return points[0];

  const mt = 1 - t;
  let x,
    y = 0;

  if (degree === 1) {
    x = mt * points[0].x + t * points[1].x;
    y = mt * points[0].y + t * points[1].y;

    return createPoint(x, y);
  }

  let mt2 = mt * mt,
    t2 = t * t,
    a,
    b,
    c,
    d = 0;

  if (degree === 2) {
    points = [points[0], points[1], points[2], createPoint(0, 0)];
    a = mt2;
    b = mt * t * 2;
    c = t2;
  } else if (degree === 3) {
    a = mt2 * mt;
    b = mt2 * t * 3;
    c = mt * t2 * 3;
    d = t * t2;
  }

  x = a * points[0].x + b * points[1].x + c * points[2].x + d * points[3].x;
  y = a * points[0].y + b * points[1].y + c * points[2].y + d * points[3].y;

  return createPoint(x, y);
};

/**
 * Computes curvature and radius at Curve location
 *
 * @param {number} t
 * @param {Point[]} dPoints
 * @returns {{ curvature: number, radius: number }}
 */
const computeCurvature = (t, dPoints) => {
  const d1 = dPoints[0],
    d2 = dPoints[1],
    d = computePointOnCurve(t, d1),
    dd = computePointOnCurve(t, d2),
    qdsum = d.x * d.x + d.y * d.y,
    num = d.x + dd.y - d.y * dd.x,
    dnm = Math.pow(qdsum, 3 / 2);

  if (num === 0 || dnm === 0) return { curvature: 0, radius: 0 };
  return {
    curvature: num / dnm,
    radius: dnm / num,
  };
};

const alignCurve = (points, p1, p2) => {
  const tx = p1.x,
    ty = p1.y,
    a = -Math.atan2(p2.y - ty, p2.x - tx),
    d = (v) => {
      const x = (v.x - tx) * Math.cos(a) - (v.y - ty) * Math.sin(a),
        y = (v.x - tx) * Math.sin(a) + (v.y - ty) * Math.cos(a);
      return createPoint(x, y);
    };

  return points.map(d);
};

/**
 * Creates a new curve
 *
 * @param {Anchor} anchor1
 * @param {Anchor} anchor2
 * @returns {Curve}
 */
const createCurve = (anchor1, anchor2) => {
  const points = [
    anchor1.point,
    anchor1.handleOut || anchor1.point,
    anchor2.handleIn || anchor2.point,
    anchor2.point,
  ];

  const derivedPoints = deriveCurve(points);

  return {
    type: 'curve',
    degree: 3,
    points,
    isLinear() {
      const a = alignCurve(
        this.points,
        this.points[0],
        this.points[this.degree]
      );
      for (let i = 0; i < a.length; i++) {
        if (Math.abs(a[i].y) > 0.0001) {
          return false;
        }
      }
      return true;
    },
    derivative(t) {
      const mt = 1 - t,
        a = mt * mt,
        b = mt * t * 2,
        c = t * t,
        p = derivedPoints[0],
        x = a * p[0].x + b * p[1].x + c * p[2].x,
        y = a * p[0].y + b * p[1].y + c * p[2].y;

      return createPoint(x, y);
    },
    arcfn(t) {
      const d = this.derivative(t);
      const l = d.x * d.x + d.y * d.y;
      return Math.sqrt(l);
    },
    getPointAt(t) {
      return computePointOnCurve(t, this.points);
    },
    getTangentAt(t) {
      return this.derivative(t).normalize();
    },
    getNormalAt(t) {
      const d = this.getTangentAt(t),
        x = -d.y,
        y = d.x;

      return createPoint(x, y);
    },
    getCurvatureAt(t) {
      const kr = computeCurvature(t, derivedPoints);
      return kr.curvature;
    },
    getRadiusAt(t) {
      const kr = computeCurvature(t, derivedPoints);
      return kr.radius;
    },
    length() {
      let z = 0.5,
        sum = 0,
        t = 0;

      for (let i = 0; i < T_VALUES.length; i++) {
        t = z * T_VALUES[i] + z;
        sum += C_VALUES[i] * this.arcfn(t);
      }

      return z * sum;
    },
    clearHandles() {
      return createCurve(anchor1.removeHandles(), anchor2.removeHandles());
    },
    toInstruction() {
      const p = this.points;
      const points = [];

      if (this.isLinear()) {
        const p2 = p[this.degree];
        return lineTo(p2.x, p2.y);
      } else {
        for (let i = 1; i < p.length; i++) {
          points.push(p[i].x);
          points.push(p[i].y);
        }

        return curveTo(...points);
      }
    },
  };
};

export default createCurve;
