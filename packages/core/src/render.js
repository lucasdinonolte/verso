import { normalizeChildren } from './utils.js';
import { isFragment } from './jsx.js';

export const renderNodeWithRenderer = (root, renderer) => {
  if (!renderer) throw new Error('No renderer provided');
  if (root === null || root === undefined) return;

  const { type, props } = root;

  if (typeof type === 'function') {
    const res = type(props, renderer);

    if (!res) return;
    renderNodeWithRenderer(res, renderer);
  } else if (isFragment(root)) {
    normalizeChildren(props.children).forEach((node) =>
      renderNodeWithRenderer(node, renderer)
    );
  } else {
    throw new Error(
      `Unkown node type: ${type}. Allowed types are custom components and Fragments.`
    );
  }
};
