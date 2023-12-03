import { normalizeChildren } from './utils.js';

/**
 * An alternative JSX pragma, to not ship the entire React
 * library with the built version of a Verso project.
 */
export const h = (component, props, ...children) => {
  if (typeof component !== 'function') {
    throw new Error(
      `Expected component to be a function, but got ${typeof component}`
    );
  }

  return {
    type: component,
    props: { ...props, children },
  };
};

export const Fragment = ({ children }) => ({
  type: Symbol.for('verso.fragment'),
  props: { children: normalizeChildren(children) },
});

export const isFragment = (node) =>
  node.type &&
  (node.type === Symbol.for('react.fragment') ||
    node.type === Symbol.for('verso.fragment'));
