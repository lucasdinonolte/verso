import { Group, Canvas, Rectangle, registerSketch } from '@verso/core';

const settings = {
  title: '11-27-2023',
  parameters: {
    background: {
      type: 'color',
      default: '#F2EFE9',
    },
    fill: {
      type: 'color',
      default: '#AB6EE0',
    },
    gutter: {
      type: 'number',
      default: -400,
      min: -500,
      max: 500,
      step: 1,
    },
    steps: {
      type: 'number',
      default: 460,
      min: 1,
      max: 1000,
      step: 1,
    },
  },
};

const sketch = registerSketch(
  ({ background, fill, width = 500, height = 500 }) => {
    return () => {
      const t = () => 0.2;

      return (
        <Canvas width={width} height={height} density={2}>
          <Group
            transform={{
              rotate: t() * 90,
              scale: { x: 0.5 * t() + 0.5, y: 0.5 * t() + 0.5 },
              shear: { x: t() * 1, y: 1 },
              origin: { x: width / 2, y: height / 2 },
            }}
            style={{ fill: fill }}
          >
            <Rectangle
              x={0}
              y={0}
              width={width}
              height={height}
              style={{ fill: background }}
            />

            <Rectangle
              x={width / 4}
              y={height / 4}
              width={width / 2}
              height={height / 2}
            />
          </Group>
        </Canvas>
      );
    };
  },
  settings
);

export default sketch;
