import {
  Canvas,
  Line,
  Path,
  registerSketch,
  createEllipsePath,
} from '@verso/core';

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
    center: {
      type: 'interactive',
      default: { x: 0, y: 0 },
      onMouseDown: (e) => ({
        x: e.clientX,
        y: e.clientY,
      }),
    },
  },
  animationDuration: 5,
};

const sketch = registerSketch(
  ({ background, fill, width = 500, height = 500, center }) => {
    const path = createEllipsePath({
      cx: width / 2,
      cy: height / 2,
      rx: 200,
      ry: 100,
    });

    return ({ playhead }) => {
      const t = Math.sin(playhead * Math.PI * 2) * 0.5 + 0.5;
      const p1 = path.getPointAt(t);
      const p2 = path.getNormalAt(t);

      const from = p1.add(p2.multiply(20));
      const to = p1.add(p2.multiply(-20));

      return (
        <Canvas width={width} height={height} density={2}>
          <Path path={path} style={{ fill }} />
          <Line
            from={from}
            to={to}
            style={{ stroke: 'red', strokeWidth: 10 }}
          />
        </Canvas>
      );
    };
  },
  settings
);

export default sketch;
