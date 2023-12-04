import colors from 'picocolors';

export const logServerUrl = ({ port, ip }) => {
  console.log();
  console.log(`${colors.bold('Verso Server')} started`);
  console.log();
  console.log(
    `${colors.green('→')} ${colors.bold('Local')}   ${colors.cyan(
      `http://localhost:${port}`
    )}`
  );
  console.log(
    `${colors.green('→')} ${colors.bold('Network')} ${colors.cyan(
      `http://${ip}:${port}`
    )}`
  );
  console.log();
};

const createLogger = (name = 'verso', withTimestamp = true) => {
  let previousWasReplaceLine = false;

  const output = (type, message, options = {}) => {
    const method = type === 'info' || type === 'success' ? 'log' : type;
    const tag =
      type === 'info'
        ? colors.cyan(colors.bold(`[${name}]`))
        : type === 'warn'
          ? colors.yellow(colors.bold(`[${name}]`))
          : type === 'success'
            ? colors.green(colors.bold(`[${name}]`))
            : colors.red(colors.bold(`[${name}]`));

    const prefix = withTimestamp
      ? `${colors.dim(new Date().toLocaleTimeString())} ${tag}`
      : tag;

    if (options.replaceLine) {
      if (options.gapBefore && !previousWasReplaceLine) console.log();
      previousWasReplaceLine = true;
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`${prefix} ${message}`);
    } else {
      if (previousWasReplaceLine) process.stdout.write('\n');
      if (options.gapBefore) console.log();
      previousWasReplaceLine = false;
      console[method](`${prefix} ${message}`);
    }
  };

  return {
    info: (message, options) => output('info', message, options),
    warn: (message, options) => output('warn', message, options),
    error: (message, options) => output('error', message, options),
    success: (message, options) => output('success', message, options),
  };
};

export const logger = createLogger();
