export default template = ({ name }) => {
  return `import { Canvas, Rectangle } from '@verso/core';

export default function Sketch({ background }) {
  return (
    <Canvas width={500} height={500}>
      <Rectangle x={0} y={0} width={500} height={500} style={{ fill: background }} />
    </Canvas>
  )
};

export const title = '${name}';

export const inputs = {
  background: {
    type: 'color',
    default: '#ffffff',
  },
};`;
};
