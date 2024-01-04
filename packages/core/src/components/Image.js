const Image = ({ image, x, y, width, height }, renderer) => {
  renderer.image({
    image,
    x,
    y,
    width,
    height,
  });
};

export default Image;
