import { Canvas, Ellipse, Rectangle, registerSketch } from '@verso/core';

import { makeFibonacciScale, normalizeNumberArray } from '../util/scales.js';
import { interpolate } from '../util/interpolation.js';

const settings = {
  title: '11-25-2023',
  animationDuration: 4,
  parameters: {
    background: {
      type: 'color',
      default: '#001122',
    },
    fill: {
      type: 'color',
      default: '#f2f2f2',
    },
    columns: {
      type: 'number',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    rows: {
      type: 'number',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
  },
};

const sketch = registerSketch(
  ({ background, fill, columns = 2, rows = 2, width = 500, height = 500 }) => {
    const scale = normalizeNumberArray(makeFibonacciScale(columns, 0));
    const reverseScale = [...scale].reverse();

    return ({ playhead }) => {
      const t = 0.5 + Math.cos(playhead * 4 * Math.PI) * 0.5;

      return (
        <Canvas width={width} height={height} density={2}>
          <Rectangle
            x={0}
            y={0}
            width={width}
            height={height}
            style={{ fill: background }}
          />

          {Array.from({ length: rows }).map((_, i) => {
            const yOff = (height / rows) * i;
            let xOff = 0;

            return Array.from({ length: columns }).map((_, j) => {
              const isEvenRow = i % 2 === 0;
              const scaleA = isEvenRow ? scale : reverseScale;
              const scaleB = isEvenRow ? reverseScale : scale;

              const rX = (width * interpolate(scaleA[j], scaleB[j], t)) / 2;
              const rY = height / rows / 2;

              const x = xOff + rX;
              const y = yOff + rY;

              xOff += rX * 2;

              return <Ellipse cx={x} cy={y} rx={rX} ry={rY} style={{ fill }} />;
            });
          })}
        </Canvas>
      );
    };
  },
  settings
);

export default sketch;
