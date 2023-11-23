import { renderNodeWithRenderer } from '../render.js';
import { normalizeChildren } from '../utils.js';

const Group = ({ children }, renderer) => {
  normalizeChildren(children).forEach((child) =>
    renderNodeWithRenderer(child, renderer)
  );
};

export default Group;
