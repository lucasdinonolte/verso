export const Text = (
  { children, fontFamily, fontSize, style, x, y },
  renderer
) => {
  renderer.text(children, x, y, { fontSize, fontFamily });
  renderer.applyStyles(style);
};
