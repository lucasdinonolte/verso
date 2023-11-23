import { parseSVGPath } from '../path.js';

export const Path = ({ path, style }, renderer) => {
  const parsedPath = parseSVGPath(path);
  renderer.beginPath();

  parsedPath.forEach(({ key, data }) => {
    switch (key) {
      case 'M': {
        renderer.moveTo(...data);
        break;
      }
      case 'L': {
        renderer.lineTo(...data);
        break;
      }
      case 'C': {
        renderer.curveTo(...data);
        break;
      }
      case 'Z': {
        renderer.close();
        break;
      }
      default: {
        throw new Error(`Unknown path command ${key}`);
      }
    }
  });

  renderer.endPath();
  renderer.applyStyles(style);
};
