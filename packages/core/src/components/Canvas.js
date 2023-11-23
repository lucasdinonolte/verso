import { renderNodeWithRenderer } from '../render.js';
import { normalizeChildren } from '../utils.js';

const Canvas = ({ background, children, density, height, width }, renderer) => {
  renderer.setup({ width, height, density });
  if (background) renderer.background(background);

  normalizeChildren(children).forEach((child) =>
    renderNodeWithRenderer(child, renderer)
  );
};

export default Canvas;
