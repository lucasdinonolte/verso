export const sketchName = (sketch) => sketch.title || 'Untitled Sketch';

export const sketchInputs = (sketch) =>
  Object.entries(sketch.inputs || []).reduce((acc, [key, input]) => {
    acc[key] = {
      ...input,
      value: input.default,
    };
    return acc;
  }, {});

export const extractInputs = (inputs) =>
  Object.entries(inputs).reduce((acc, [key, input]) => {
    acc[key] = input.value;
    return acc;
  }, {});
