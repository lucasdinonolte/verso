const normalizeChildren = (items) => (Array.isArray(items) ? items : [items]).flat(Infinity);
const omit = (obj, names) => {
  let result = {};
  let index = {};
  let idx = 0;
  const len = names.length;
  while (idx < len) {
    index[names[idx]] = 1;
    idx += 1;
  }
  for (const prop in obj) {
    if (!index.hasOwnProperty(prop)) {
      result[prop] = obj[prop];
    }
  }
  return result;
};
const h = (component, props, ...children) => {
  if (typeof component !== "function") {
    throw new Error(
      `Expected component to be a function, but got ${typeof component}`
    );
  }
  return {
    type: component,
    props: { ...props, children }
  };
};
const isFragment = (node) => node.type && (node.type === Symbol.for("react.fragment") || node.type === Symbol.for("verso.fragment"));
const renderNodeWithRenderer = (root, renderer) => {
  if (!renderer)
    throw new Error("No renderer provided");
  const { type, props } = root;
  if (typeof type === "function") {
    const res = type(props, renderer);
    if (!res)
      return;
    renderNodeWithRenderer(res, renderer);
  } else if (isFragment(root)) {
    normalizeChildren(props.children).forEach(
      (node) => renderNodeWithRenderer(node, renderer)
    );
  } else {
    throw new Error(
      `Unkown node type: ${type}. Allowed types are custom components and Fragments.`
    );
  }
};
const Canvas = ({ background, children, density, height, width }, renderer) => {
  renderer.setup({ width, height, density });
  if (background)
    renderer.background(background);
  normalizeChildren(children).forEach(
    (child) => renderNodeWithRenderer(child, renderer)
  );
};
const identityTransforms = {
  translate: { x: 0, y: 0 },
  rotate: 0,
  scale: { x: 1, y: 1 },
  shear: { x: 0, y: 0 },
  origin: { x: 0, y: 0 }
};
const transformationMatrixFromSemanticTransforms = (props, origin) => {
  const matrix = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    tx: 0,
    ty: 0
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
    const angle = props.rotate * Math.PI / 180;
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
const getTransformationMatrix = (transforms) => {
  const props = {
    ...identityTransforms,
    ...transforms
  };
  return transformationMatrixFromSemanticTransforms(props, props.origin);
};
const invertTransformationMatrix = (matrix) => {
  const { a, b, c, d, tx, ty } = matrix;
  const determinant = a * d - b * c;
  return {
    a: d / determinant,
    b: -b / determinant,
    c: -b / determinant,
    d: a / determinant,
    tx: (c * ty - d * tx) / determinant,
    ty: (b * tx - a * ty) / determinant
  };
};
const parseScale = ({ scale }) => {
  if (typeof scale === "number")
    return { x: scale, y: scale };
  return {
    x: (scale == null ? void 0 : scale.x) ?? 1,
    y: (scale == null ? void 0 : scale.y) ?? 1
  };
};
const parseTranslate = ({ translate, translateX, translateY }) => {
  if (translate)
    return {
      x: (translate == null ? void 0 : translate.x) ?? 0,
      y: (translate == null ? void 0 : translate.y) ?? 0
    };
  return {
    x: translateX ?? 0,
    y: translateY ?? 0
  };
};
const parseRotate = ({ rotate }) => {
  return rotate ?? 0;
};
const parseShear = ({ shear, shearX, shearY }) => {
  if (shear) {
    return {
      x: (shear == null ? void 0 : shear.x) ?? 0,
      y: (shear == null ? void 0 : shear.y) ?? 0
    };
  }
  return {
    x: shearX ?? 0,
    y: shearY ?? 0
  };
};
const parseOrigin = ({ origin }) => {
  return {
    x: (origin == null ? void 0 : origin.x) ?? 0,
    y: (origin == null ? void 0 : origin.y) ?? 0
  };
};
const parseTransform = (props) => {
  return {
    translate: parseTranslate(props),
    scale: parseScale(props),
    rotate: parseRotate(props),
    shear: parseShear(props),
    origin: parseOrigin(props)
  };
};
const Group = ({ children, style, transform }, renderer) => {
  const matrix = getTransformationMatrix(parseTransform(transform));
  renderer.transform(matrix);
  normalizeChildren(children).forEach((child) => {
    renderNodeWithRenderer(
      {
        ...child,
        props: {
          ...child.props,
          style: {
            ...style,
            ...child.props.style
          }
        }
      },
      renderer
    );
  });
  renderer.transform(invertTransformationMatrix(matrix));
};
const Rectangle = ({ x, y, width, height, style }, renderer) => {
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
const DEFAULT_SETTINGS = {
  animationDuration: 0,
  fps: 60,
  parameters: {}
};
const mergeSettings = (settings2) => ({
  ...DEFAULT_SETTINGS,
  ...settings2
});
const getSketchParameters = (settings2) => Object.entries(settings2.parameters || []).reduce((acc, [key, input]) => {
  acc[key] = {
    ...input,
    value: input.default
  };
  return acc;
}, {});
const registerSketch = (fn, _settings) => {
  const settings2 = mergeSettings(_settings);
  return {
    setup: fn,
    parameters: getSketchParameters(settings2),
    settings: omit(settings2, ["parameters"])
  };
};
const settings = {
  title: "11-27-2023",
  animationDuration: 5,
  parameters: {
    background: {
      type: "color",
      default: "#F2EFE9"
    },
    fill: {
      type: "color",
      default: "#AB6EE0"
    },
    gutter: {
      type: "number",
      default: -400,
      min: -500,
      max: 500,
      step: 1
    },
    steps: {
      type: "number",
      default: 460,
      min: 1,
      max: 1e3,
      step: 1
    }
  }
};
const sketch = registerSketch(
  ({ background, fill, width = 500, height = 500 }) => {
    return ({ playhead }) => {
      const t = () => Math.sin(playhead * Math.PI * 2);
      return /* @__PURE__ */ h(Canvas, { width, height, density: 2 }, /* @__PURE__ */ h(
        Group,
        {
          transform: {
            rotate: t() * 90,
            scale: { x: 0.5 * t() + 0.5, y: 0.5 * t() + 0.5 },
            shear: { x: t() * 1, y: 1 },
            origin: { x: width / 2, y: height / 2 }
          },
          style: { fill }
        },
        /* @__PURE__ */ h(
          Rectangle,
          {
            x: 0,
            y: 0,
            width,
            height,
            style: { fill: background }
          }
        ),
        /* @__PURE__ */ h(
          Rectangle,
          {
            x: width / 4,
            y: height / 4,
            width: width / 2,
            height: height / 2
          }
        )
      ));
    };
  },
  settings
);
export {
  sketch as default
};
