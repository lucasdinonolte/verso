import { renderToPDF } from '../renderers/pdf.js';

export const exportToPDF = async (sketch) => {
  const isRenderFunction = typeof sketch === 'function';

  const renderTree = isRenderFunction
    ? sketch({ frame: 0, time: 0, playhead: 0 })
    : sketch;

  const renderResult = renderToPDF(renderTree);
  const res = await renderResult.export();

  return res;
};
