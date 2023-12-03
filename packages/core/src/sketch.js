import { mergeSettings } from './settings.js';
import { omit } from './utils.js';

export const getSketchParameters = (settings) =>
  Object.entries(settings.parameters || []).reduce((acc, [key, input]) => {
    acc[key] = {
      ...input,
      value: input.default,
    };
    return acc;
  }, {});

export const registerSketch = (fn, _settings) => {
  const settings = mergeSettings(_settings);

  return {
    setup: fn,
    parameters: getSketchParameters(settings),
    settings: omit(settings, ['parameters']),
  };
};
