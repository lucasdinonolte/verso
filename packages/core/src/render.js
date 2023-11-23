import { normalizeChildren } from './utils.js';

const isFragment = (node) =>
  node.type &&
  (node.type === Symbol.for('react.fragment') ||
    node.type === Symbol.for('verso.fragment'));

export const renderNodeWithRenderer = (root, renderer) => {
  if (!renderer) throw new Error('No renderer provided');

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
