/**
 * Creates an Offscreen Canvas in Browsers that support it.
 * Falls back to a regular Canvas in other browsers.
 *
 * @returns {HTMLCanvasElement | OffscreenCanvas}
 */
export const createCanvas = () => {
  return document.createElement('canvas');
};
