/**
 * @typedef {Object} Anchor
 * @property {"anchor"} type
 * @property {Point} point
 * @property {Point|null} handleIn
 * @property {Point|null} handleOut
 * @property {() => boolean} hasHandles
 * @property {() => void} removeHandles
 */

/**
 * Creates a new anchore
 *
 * @param {Point} point the on curve point
 * @param {Point|null} handleIn first off curve point
 * @param {Point|null} handleOut second off curve point
 * @returns {Anchor}
 */
const createAnchor = (point, handleIn = null, handleOut = null) => ({
  type: 'anchor',
  point,
  handleIn,
  handleOut,
  hasHandles() {
    return this.handleIn !== null || this.handleOut !== null;
  },
  removeHandles() {
    return createAnchor(this.point, null, null);
  },
});

export default createAnchor;
