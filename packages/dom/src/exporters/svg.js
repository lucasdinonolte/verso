import { renderToSVG } from '../renderers/svg.js';

export const exportToSVG = (sketch) => {
  const isRenderFunction = typeof sketch === 'function';

  const node = document.createElement('div');

  const renderTree = isRenderFunction
    ? sketch({ frame: 0, time: 0, playhead: 0 })
    : sketch;

  const renderResult = renderToSVG(renderTree, node);
  const res = renderResult.export();

  return res;
};
