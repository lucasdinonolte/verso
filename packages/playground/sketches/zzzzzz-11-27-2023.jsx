import { Canvas, Path, Rectangle, registerSketch } from '@verso/core';

import { makeFibonacciScale, normalizeNumberArray } from '../util/scales.js';
import { interpolate } from '../util/interpolation.js';

const settings = {
  title: '11-27-2023',
  animationDuration: 5,
  parameters: {
    background: {
      type: 'color',
      default: '#031426',
    },
    fill: {
      type: 'color',
      default: '#E8E8D8',
    },
    gutter: {
      type: 'number',
      default: -400,
      min: -500,
      max: 500,
      step: 1,
    },
    columns: {
      type: 'number',
      default: 7,
      min: 1,
      max: 40,
      step: 1,
    },
    rows: {
      type: 'number',
      default: 60,
      min: 1,
      max: 100,
      step: 1,
    },
  },
};

const Triangle = ({ x, y, w, h, style }) => {
  return (
    <Path
      path={`M ${x} ${y - h / 2} L ${x + w} ${y} L ${x} ${y + h / 2} Z`}
      style={style}
    />
  );
};

const sketch = registerSketch(
  ({
    background,
    fill,
    gutter,
    columns = 2,
    rows = 2,
    width = 500,
    height = 500,
  }) => {
    const scale = normalizeNumberArray(makeFibonacciScale(columns, 1));
    const reverseScale = [...scale].reverse();

    const totalW = width - gutter * 2;
    const totalH = height - gutter * 2;

    return ({ playhead }) => {
      const t = 0.5 + Math.cos(playhead * Math.PI * 2) * 0.5;

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
            const yOff = (totalH / rows) * i + gutter;
            let xOff = gutter;
            const cols = columns;

            return Array.from({ length: cols }).map((_, j) => {
              const scaleA = scale;
              const scaleB = reverseScale;

              const w =
                totalW * interpolate(scaleA[j], scaleB[j], t) -
                Math.sin((i + j) * 0.125) * 10;

              const h = totalH / rows;

              const x = xOff;
              const y = yOff;

              xOff += w;

              return (
                <Triangle
                  x={x}
                  y={y + h / 2}
                  w={w}
                  h={h * 0.25}
                  style={{ fill }}
                />
              );
            });
          })}
        </Canvas>
      );
    };
  },
  settings
);

export default sketch;
