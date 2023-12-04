import { renderNodeWithRenderer } from '@verso/core';

/**
 * @typedef {Object} Renderer
 * @property {Function} setup
 * @property {Function} text
 * @property {Function} beginPath
 * @property {Function} transform
 * @property {Function} [endPath]
 * @property {Function} moveTo
 * @property {Function} lineTo
 * @property {Function} curveTo
 * @property {Function} close
 * @property {Function} applyStyles
 * @property {Function} export
 */

/**
 * @param {Renderer} renderer
 */
export const registerRenderer = (
  {
    init = () => { },
    setup = () => { },
    text = () => { },
    transform = () => { },
    beginPath = () => { },
    endPath = () => { },
    moveTo = () => { },
    lineTo = () => { },
    curveTo = () => { },
    close = () => { },
    applyStyles = () => { },
    export: _export = () => { },
  } = {},
  _options = {}
) => {
  const renderFn = (root, ...args) => {
    const globals = init(root, ...args);

    const withGlobals =
      (fn) =>
        (...args) =>
          fn(...args, globals);

    const renderer = {
      setup: withGlobals(setup),
      text: withGlobals(text),
      transform: withGlobals(transform),
      beginPath: withGlobals(beginPath),
      endPath: withGlobals(endPath),
      moveTo: withGlobals(moveTo),
      lineTo: withGlobals(lineTo),
      curveTo: withGlobals(curveTo),
      close: withGlobals(close),
      applyStyles: withGlobals(applyStyles),
    };

    renderNodeWithRenderer(root, renderer);

    return {
      export: (...args) => _export(...args, globals),
    };
  };

  renderFn.options = _options;

  return renderFn;
};
