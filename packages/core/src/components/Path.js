import { parseSVGPath } from '../svgPath.js';

export const Path = ({ path, style }, renderer) => {
  if (!path) return null;

  const isSVGPath = typeof path === 'string';
  const isCommandArray = Array.isArray(path);

  const isPathObject = path.type === 'path' || path.type === 'compoundPath';
  const isCompoundPath = path.type === 'compoundPath';

  const commands = isCommandArray
    ? path
    : isSVGPath
      ? parseSVGPath(path)
      : null;

  const renderCommands = (commands) => {
    commands.forEach(({ type, data }) => {
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
  };

  const renderPath = (path) => {
    renderCommands(path.toInstructions());
  };

  renderer.beginPath();

  if (isCompoundPath) {
    path.paths.forEach(renderPath);
  } else if (isPathObject) {
    renderPath(path);
  }

  if (commands) {
    renderCommands(commands);
  }

  renderer.endPath();
  renderer.applyStyles(style);
};
