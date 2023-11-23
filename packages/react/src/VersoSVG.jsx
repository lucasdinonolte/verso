import React, { useEffect, useRef } from 'react';
import { renderToSVG } from '@verso/dom';

import { mergeRefs } from './util.js';

export const VersoSVG = React.forwardRef(
  ({ children, width, height, density, fonts }, externalRef) => {
    const containerRef = useRef(null);

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.replaceChildren();
        renderToSVG(children, containerRef.current, {
          width,
          height,
          density,
          fonts,
        });
      }
    }, [containerRef, children]);

    return (
      <div
        width={width}
        height={height}
        ref={mergeRefs(externalRef, containerRef)}
      />
    );
  }
);
