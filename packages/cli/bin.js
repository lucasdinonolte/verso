#!/usr/bin/env node

import sade from 'sade';
import dev from './src/commands/dev.js';
import render from './src/commands/render.js';

import { getConfig } from './src/util/config.js';

const main = async () => {
  const prog = sade('verso').version('0.0.1');
  const config = await getConfig();

  prog
    .command('dev')
    .describe('Starts a local dev server of the current Versio project')
    .action(() => {
      dev(config);
    });

  prog.command('render <input> <output>').action((input, output, opts) => {
    render(input, output, opts);
  });

  prog.parse(process.argv);
};

main();
