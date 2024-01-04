import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { build as esbuild } from 'esbuild';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { exportToPNG, exportToSVG, exportToPDF } from '@verso/node';
import { registerFont } from '@verso/core';

const app = new Hono();

let font;

app.get('/:color/png', async (c) => {
  const module = await import(resolveBuild('index.js'));
  const Sketch = module.default;

  const res = exportToPNG(Sketch({ color: c.req.param('color'), font }));

  c.header('Content-Type', res.mimeType);
  c.status(200);
  return c.body(res.data);
});

app.get('/:color/svg', async (c) => {
  const module = await import(resolveBuild('index.js'));
  const Sketch = module.default;

  const res = exportToSVG(Sketch({ color: c.req.param('color'), font }));

  c.header('Content-Type', res.mimeType);
  c.status(200);
  return c.body(res.data);
});

app.get('/:color/pdf', async (c) => {
  const module = await import(resolveBuild('index.js'));
  const Sketch = module.default;

  const res = await exportToPDF(Sketch({ color: c.req.param('color'), font }));

  c.header('Content-Type', res.mimeType);
  c.status(200);
  return c.body(res.data);
});

// UTIL
const sketchDir = new URL('./sketches/', import.meta.url);
const staticDir = new URL('./static/', import.meta.url);
const buildDir = new URL('../build/', import.meta.url);

function resolveSketch(path = '') {
  return fileURLToPath(new URL(path, sketchDir));
}

function resolveBuild(path = '') {
  return fileURLToPath(new URL(path, buildDir));
}

function resolveStatic(path = '') {
  return fileURLToPath(new URL(path, staticDir));
}

async function build() {
  await esbuild({
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    entryPoints: [resolveSketch('index.jsx')],
    outdir: resolveBuild(),
    packages: 'external',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    banner: {
      js: 'import { h, Fragment } from "@verso/core";',
    },
  });

  const fontFile = await readFile(resolveStatic('apercu.otf'));
  font = registerFont(fontFile.buffer);
}

serve(app, async (info) => {
  await build();
  console.log(`Listening on http://localhost:${info.port}`);
});
