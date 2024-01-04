import { renderToSVG } from '../renderers/svg.js';

export const exportToSVG = (sketch) => {
  const isRenderFunction = typeof sketch === 'function';

  const renderTree = isRenderFunction
    ? sketch({ frame: 0, time: 0, playhead: 0 })
    : sketch;

  const renderResult = renderToSVG(renderTree);
  const res = renderResult.export();

  return res;
};
