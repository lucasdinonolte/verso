import { Path } from './Path.js';

export const Text = (
  {
    align = 'left',
    children,
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing = 0,
    style,
    x,
    y,
    width,
    height,
  },
  renderer
) => {
  if (!children) return null;

  const text = typeof children === 'string' ? children : children.join('');
  const options = { kerning: true, lineHeight, fontSize, letterSpacing, align };
  const lines = fontFamily.getLines(text, width, height, options);

  // If the renderer we’re using has a text method we’ll go ahead and
  // use it, as this is likely to be much more performant than our fallback
  // rendering converting everything to a Verso path first.
  if (typeof renderer.text === 'function') {
    renderer.text({
      align,
      lines,
      fontFamily,
      fontSize,
      lineHeight,
      letterSpacing,
      x,
      y,
      width,
      height,
      style,
    });

    return;
  }

  lines.forEach((line) => {
    const commands = fontFamily.convertToCommands(
      line.text,
      x + line.x,
      y + line.y,
      options
    );

    Path({ path: commands, style }, renderer);
  });
};
