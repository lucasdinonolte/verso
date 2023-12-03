const identityTransforms = {
  translate: { x: 0, y: 0 },
  rotate: 0,
  scale: { x: 1, y: 1 },
  shear: { x: 0, y: 0 },
  origin: { x: 0, y: 0 },
};

/**
 * Turns the transforms into an affine 2d transformation matrix
 * and returns a function that will apply this matrix to a given
 * point around a center point.
 *
 * Such a coordinate transformation can be represented by a 3 row by 3
 * column matrix with an implied last row of `[ 0 0 1 ]`. This matrix
 * transforms source coordinates `(x, y)` into destination coordinates `(x',y')`
 * by considering them to be a column vector and multiplying the coordinate
 * vector by the matrix according to the following process:
 *
 *     [ x ]   [ a  c  tx ] [ x ]   [ a * x + c * y + tx ]
 *     [ y ] = [ b  d  ty ] [ y ] = [ b * x + d * y + ty ]
 *     [ 1 ]   [ 0  0  1  ] [ 1 ]   [         1          ]
 *
 * The following matrix math code is an adapation of both paper.js and
 * transformation-matrix-js
 *
 * https://github.com/paperjs/paper.js/blob/develop/src/basic/Matrix.js#L286
 * https://github.com/deoxxa/transformation-matrix-js/blob/master/src/matrix.js#L516
 */
const transformationMatrixFromSemanticTransforms = (props, origin) => {
  const matrix = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    tx: 0,
    ty: 0,
  };

  const translate = ({ x, y }) => {
    matrix.tx += x * matrix.a + y * matrix.c;
    matrix.ty += x * matrix.b + y * matrix.d;
  };

  if (props.translate) {
    translate(props.translate);
  }

  if (props.scale) {
    const { x, y } = props.scale;
    translate(origin);
    matrix.a *= x;
    matrix.b *= x;
    matrix.c *= y;
    matrix.d *= y;
    translate({ x: -1 * origin.x, y: -1 * origin.y });
  }

  if (props.rotate) {
    const angle = (props.rotate * Math.PI) / 180;
    const { x, y } = origin;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const tx = x - x * cos + y * sin;
    const ty = y - x * sin - y * cos;
    const a = matrix.a;
    const b = matrix.b;
    const c = matrix.c;
    const d = matrix.d;

    matrix.a = cos * a + sin * c;
    matrix.b = cos * b + sin * d;
    matrix.c = -sin * a + cos * c;
    matrix.d = -sin * b + cos * d;
    matrix.tx += tx * a + ty * c;
    matrix.ty += tx * b + ty * d;
  }

  if (props.shear) {
    const { x, y } = props.shear;
    const a = matrix.a;
    const b = matrix.b;

    translate(origin);
    matrix.a += y * matrix.c;
    matrix.b += y * matrix.d;
    matrix.c += x * a;
    matrix.d += x * b;
    translate({ x: -1 * origin.x, y: -1 * origin.y });
  }

  return matrix;
};

/**
 * Returns the affine 2d transformation matrix for an elements set of
 * transforms.
 *
 * @param {Object} transforms
 * @returns {Object} matrix
 */
export const getTransformationMatrix = (transforms) => {
  const props = {
    ...identityTransforms,
    ...transforms,
  };

  return transformationMatrixFromSemanticTransforms(props, props.origin);
};

/**
 * Appends a transformation matrix to another, essentially doing
 * matrix1 * matrix2.
 *
 * @param {Object} matrix
 * @param {Object} transforms
 * @returns {Object} matrix
 */
export const appendTransformationMatrix = (matrix, transforms) => {
  const a1 = matrix.a;
  const b1 = matrix.b;
  const c1 = matrix.c;
  const d1 = matrix.d;
  const tx1 = matrix.tx;
  const ty1 = matrix.ty;

  const a2 = transforms.a;
  const b2 = transforms.b;
  const c2 = transforms.c;
  const d2 = transforms.d;
  const tx2 = transforms.tx;
  const ty2 = transforms.ty;

  return {
    a: a2 * a1 + c2 * c1,
    b: b2 * a1 + d2 * c1,
    c: a2 * b1 + c2 * d1,
    d: b2 * b1 + d2 * d1,
    tx: tx1 + (tx2 * a1 + ty2 * c1),
    ty: ty1 + (tx2 * b1 + ty2 * d1),
  };
};

/**
 * Inverts a transformation matrix.
 *
 * @param {Object} matrix
 * @returns {Object} inverted matrix
 */
export const invertTransformationMatrix = (matrix) => {
  const { a, b, c, d, tx, ty } = matrix;
  const determinant = a * d - b * c;

  return {
    a: d / determinant,
    b: -b / determinant,
    c: -b / determinant,
    d: a / determinant,
    tx: (c * ty - d * tx) / determinant,
    ty: (b * tx - a * ty) / determinant,
  };
};

export const identityMatrix = {
  a: 1,
  b: 0,
  c: 0,
  d: 1,
  tx: 0,
  ty: 0,
};

/**
 * Compares a transformation matrix to the identity matrix.
 *
 * @param {Object} transform
 * @returns {Boolean}
 */
export const isIdentityMatrix = (transform) => {
  return (
    transform.a === identityMatrix.a &&
    transform.b === identityMatrix.b &&
    transform.c === identityMatrix.c &&
    transform.d === identityMatrix.d &&
    transform.tx === identityMatrix.tx &&
    transform.ty === identityMatrix.ty
  );
};

/**
 * Parses scale transforms from props. Accepting both a single
 * number and explicit x and y values.
 */
const parseScale = ({ scale }) => {
  if (typeof scale === 'number') return { x: scale, y: scale };
  return {
    x: scale?.x ?? 1,
    y: scale?.y ?? 1,
  };
};

/**
 * Parses translate transforms from props. Accepting both single
 * numbers for `translateX`and `translateY` as well as an object
 * holding `x` and `y` values.
 */
const parseTranslate = ({ translate, translateX, translateY }) => {
  if (translate)
    return {
      x: translate?.x ?? 0,
      y: translate?.y ?? 0,
    };

  return {
    x: translateX ?? 0,
    y: translateY ?? 0,
  };
};

/**
 * Parses a rotate value. Expects value to be given as a single
 * number representing the angle in degrees.
 */
const parseRotate = ({ rotate }) => {
  return rotate ?? 0;
};

/**
 * Parses the shear transform from props. Accepts both single
 * numbers for `shearX` and `shearY` as well as an object holding
 * `x` and `y` values.
 */
const parseShear = ({ shear, shearX, shearY }) => {
  if (shear) {
    return {
      x: shear?.x ?? 0,
      y: shear?.y ?? 0,
    };
  }

  return {
    x: shearX ?? 0,
    y: shearY ?? 0,
  };
};

/**
 * Parses the transform origin from props.
 */
const parseOrigin = ({ origin }) => {
  return {
    x: origin?.x ?? 0,
    y: origin?.y ?? 0,
  };
};

/**
 * Parses all transform props and returns a normalized object
 * container all transform values in the format expected by
 * the matrix functions.
 */
export const parseTransform = (props) => {
  return {
    translate: parseTranslate(props),
    scale: parseScale(props),
    rotate: parseRotate(props),
    shear: parseShear(props),
    origin: parseOrigin(props),
  };
};
