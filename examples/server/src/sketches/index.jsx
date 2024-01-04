import { Canvas, Rectangle, Text } from '@verso/core';

function Sketch({ color, font }) {
  const text = 'Hello\nWorld';

  return (
    <Canvas width={200} height={100} density={2}>
      <Rectangle x={0} y={0} width={100} height={100} style={{ fill: color }} />
      {font && (
        <Text
          align="right"
          width={200}
          height={200}
          x={0}
          y={0}
          fontFamily={font}
          fontSize={20}
          lineHeight={32}
          style={{ fill: 'black' }}
        >
          {text}
        </Text>
      )}
    </Canvas>
  );
}

export default Sketch;
