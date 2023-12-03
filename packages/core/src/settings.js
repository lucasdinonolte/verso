/**
 * @typedef {Object} Settings
 * @property {number} animationDuration
 * @property {number} fps
 * @property {Object} parameters
 */

export const DEFAULT_SETTINGS = {
  animationDuration: 0,
  fps: 60,
  parameters: {},
};

/**
 * Merges user settings with the default settings
 * with the user settings taking precedence.
 * @param {Partial<Settings>} settings
 * @returns {Settings}
 */
export const mergeSettings = (settings) => ({
  ...DEFAULT_SETTINGS,
  ...settings,
});
