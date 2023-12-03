export const sketchName = (sketch) => {
  return sketch.title || 'Untitled Sketch';
};

export const extractParameterValues = (parameters) =>
  Object.entries(parameters).reduce((acc, [key, param]) => {
    acc[key] = param.value;
    return acc;
  }, {});
