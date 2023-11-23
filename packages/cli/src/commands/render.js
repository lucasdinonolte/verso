import { join } from 'path';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';
import { build } from 'vite';
import react from '@vitejs/plugin-react';

import { renderToSVG } from '@verso/node';

import { sketchInputs, extractInputs } from '../app/util/sketch.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const buildCommand = async (entry, output, options) => {
  const tempDir = join(process.cwd(), '.tmp');

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
      minify: false,
      outDir: tempDir,
    },
    plugins: [react()],
  });

  const module = await import(join(tempDir, './sketch.js'));
  const inputs = sketchInputs(module);
  const inputValues = {
    ...extractInputs(inputs),
    ...options,
  };

  const res = renderToSVG(module.default(inputValues));
  const { data } = res.export();
  await writeFile(join(process.cwd(), output), data, 'utf-8');
};

export default buildCommand;
