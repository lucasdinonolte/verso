import { join } from 'path';
import { writeFile } from 'fs/promises';

import { renderToCanvas, renderToSVG, renderToPDF } from '@verso/node';

import { logger } from './logger.js';
import { zeroPadToMatch } from '../app/util/format.js';

const BUILT_IN_RENDERERS = [renderToCanvas, renderToSVG, renderToPDF];
const USER_RENDERERS = [];

const supportsExtension = (renderer, extension) => {
  const extensions = Object.keys(renderer.options.extensions);
  return extensions.includes(extension);
};

const getFrameCallback = (renderer, { mimeType, name, path, extension }) => {
  return (renderFn, maxFrames) => {
    const isAnimated = maxFrames > 0;
    return async ({ frame, time, playhead }) => {
      if (isAnimated) {
        logger.info(`Rendering frame ${frame} / ${maxFrames}`, {
          replaceLine: true,
        });
      }

      const res = renderer(renderFn({ frame, time, playhead }));
      const { data, buffer } = await res.export(mimeType);

      const renderToFile = isAnimated
        ? `${zeroPadToMatch(frame, maxFrames)}-${name}.${extension}`
        : `${name}.${extension}`;

      if (data) {
        await writeFile(join(path, renderToFile), data, 'utf-8');
      }

      if (buffer) {
        await writeFile(join(path, renderToFile), buffer);
      }
    };
  };
};

export const getRenderer = ({ path, name, extension }) => {
  const allRenderers = [...USER_RENDERERS, ...BUILT_IN_RENDERERS];

  const renderer = allRenderers.find((renderer) =>
    supportsExtension(renderer, extension)
  );

  if (!renderer) {
    return null;
  }

  const mimeType = renderer.options.extensions[extension];

  return getFrameCallback(renderer, {
    mimeType,
    name,
    path,
    extension,
  });
};
