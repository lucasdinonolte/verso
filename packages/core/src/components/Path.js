import createPath from '../path.js';

export const Path = ({ path, style }, renderer) => {
  const isPathObject = path.type === 'path';
  const parsedPath = isPathObject ? path : createPath(path);

  renderer.beginPath();

  parsedPath.toInstructions().forEach(({ type, data }) => {
    switch (type) {
      case 'moveTo': {
        renderer.moveTo(...data);
        break;
      }
      case 'lineTo': {
        renderer.lineTo(...data);
        break;
      }
      case 'curveTo': {
        renderer.curveTo(...data);
        break;
      }
      case 'close': {
        renderer.close();
        break;
      }
    }
  });

  renderer.endPath();
  renderer.applyStyles(style);
};
