import { renderToCanvas } from '../renderers/canvas.js';
import { createCanvas } from '../util/canvas.js';

const exportToBitmapFactory = (mimeType) => (sketch) => {
  const isRenderFunction = typeof sketch === 'function';

  const canvas = createCanvas();

  const renderTree = isRenderFunction
    ? sketch({ frame: 0, time: 0, playhead: 0 })
    : sketch;

  const renderResult = renderToCanvas(renderTree, canvas);
  const res = renderResult.export(mimeType);

  return res;
};

export const exportToPNG = exportToBitmapFactory('image/png');
export const exportToJPG = exportToBitmapFactory('image/jpeg');
export const exportToWEBP = exportToBitmapFactory('image/webp');
