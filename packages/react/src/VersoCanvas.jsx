import React, { useEffect, useRef } from 'react';
import { renderToCanvas } from '@verso/dom';

import { mergeRefs } from './util';

export const VersoCanvas = React.forwardRef(
  ({ children, width, height, density, fonts }, externalRef) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      if (canvasRef.current) {
        containerRef.current.replaceChildren();
        renderToCanvas(children, canvasRef.current, {
          width,
          height,
          density,
          fonts,
        });
      }
    }, [canvasRef, children]);

    return (
      <canvas
        width={width}
        height={height}
        ref={mergeRefs(externalRef, canvasRef)}
      />
    );
  }
);
