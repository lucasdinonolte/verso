import { drawloop } from '@verso/core';

import { logger } from '../util/logger.js';
import { buildSketch, ensureOutputDir, outName } from '../util/sketch.js';
import { getRenderer } from '../util/renderers.js';
import { extractParameterValues } from '../app/util/sketch.js';

const buildCommand = async (entry, output, options) => {
  const outFile = outName(output);

  await ensureOutputDir(outFile.path);

  const renderer = getRenderer(outFile);

  if (!renderer) {
    logger.error(
      'No renderer was found for the given extension. Did you mean to register a custom renderer?'
    );
    process.exit(1);
  }

  logger.info('Compiling Sketch', { replaceLine: true });
  const sketchDistFile = await buildSketch(entry);
  logger.success('Compiled Sketch', { replaceLine: true });

  logger.info('Rendering Sketch');

  const module = await import(sketchDistFile);
  const { parameters, settings, setup } = module.default;

  const parameterValues = {
    ...extractParameterValues(parameters),
    ...options,
  };

  const maxFrames = settings.fps * settings.animationDuration;
  const renderFn = await setup(parameterValues);

  await drawloop({
    fps: settings.fps,
    maxFrames,
    onFrame: renderer(renderFn, maxFrames),
    onDone: () => {
      logger.success('Done');
    },
  });
};

export default buildCommand;
