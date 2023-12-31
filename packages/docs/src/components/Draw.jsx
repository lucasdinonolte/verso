import React from 'react';
import { Canvas, Path } from '@verso/core';
import { VersoCanvas } from '@verso/react';

const Draw = () => {
  return (
    <VersoCanvas>
      <Canvas width={500} height={500} density={2}>
        <Path
          path="M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
          style={{ fill: 'cyan' }}
        />
      </Canvas>
    </VersoCanvas>
  );
};

export default Draw;
