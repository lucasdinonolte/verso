import { join } from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';
import { build } from 'vite';

import { renderToCanvas } from '@verso/node';
import { drawloop } from '@verso/core';

import { extractParameterValues } from '../app/util/sketch.js';
import { zeroPadToMatch } from '../app/util/format.js';
import { versoVitePlugin } from '../lib/compiler.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const buildCommand = async (entry, output, options) => {
  const tempDir = join(process.cwd(), '.tmp');

  console.time('build');

  await build({
    configFile: false,
    root: join(__dirname, '..', 'app'),
    publicDir: join(__dirname, '..', 'app', 'public'),
    mode: 'production',
    logLevel: 'error',
    build: {
      lib: {
        entry: join(process.cwd(), entry),
        formats: ['es'],
        name: 'sketch',
        fileName: 'sketch',
      },
      // Don’t minify for rendering, to keep the build step
      // a bit faster.
      minify: false,
      outDir: tempDir,
    },
    plugins: [versoVitePlugin()],
  });
  console.timeEnd('build');

  console.time('render');

  const module = await import(join(tempDir, './sketch.js'));

  const { parameters, settings, setup } = module.default;

  const parameterValues = {
    ...extractParameterValues(parameters),
    ...options,
  };

  const maxFrames = settings.fps * settings.animationDuration;
  const isAnimated = maxFrames > 0;
  const renderFn = await setup(parameterValues);

  await drawloop({
    fps: settings.fps,
    maxFrames,
    onFrame: async ({ frame, time, playhead }) => {
      console.log(`Frame ${frame} / ${maxFrames}`);
      const res = renderToCanvas(renderFn({ frame, time, playhead }));
      const { data, buffer } = res.export();

      const outName = isAnimated
        ? output.replace('.png', `-${zeroPadToMatch(frame, maxFrames)}.png`)
        : output;

      if (data) {
        await writeFile(join(process.cwd(), outName), data, 'utf-8');
      }

      if (buffer) {
        await writeFile(join(process.cwd(), outName), buffer);
      }
    },
    onDone: () => {
      console.timeEnd('render');
      console.log('Done');
    },
  });
};

export default buildCommand;
