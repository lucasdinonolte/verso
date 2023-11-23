import { Canvas, Circle } from '@verso/core';

export default function Sketch({ color, radius }) {
  return (
    <Canvas width={500} height={500} density={2}>
      <Circle
        cx={250}
        cy={250}
        r={parseFloat(radius)}
        style={{ fill: color }}
      />
    </Canvas>
  );
}

export const title = 'Demo';

export const inputs = {
  color: {
    type: 'color',
    default: '#ff0000',
  },
  radius: {
    type: 'number',
    default: 100,
    min: 0,
    max: 500,
    step: 10,
  },
  title: {
    type: 'text',
    default: '',
  },
};
