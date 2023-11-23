import { Canvas, Circle } from '@verso/core';

export default function Sketch() {
  return (
    <Canvas width={500} height={500} density={2}>
      <Circle cx={250} cy={250} r={100} style={{ fill: 'orange' }} />
    </Canvas>
  );
}

export const title = 'Another Demo';
