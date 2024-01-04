import React, { useEffect, useRef } from 'react';

import { renderToCanvas } from '@verso/dom';
import { drawloop, mergeSettings } from '@verso/core';

import { mergeRefs } from './util.js';

export const Verso = React.forwardRef(
  ({ children, settings: _settings, ...rest }, externalRef) => {
    const root =
      typeof children === 'function' || children.type.name === 'Canvas'
        ? children
        : children.type(children.props);

    if (typeof root !== 'function' && root.type?.name !== 'Canvas') {
      throw new Error(
        'VersoCanvas: Please don’t nest VersoCanvas more the one level deep'
      );
    }

    const settings = mergeSettings(_settings);
    const canvasRef = useRef(null);

    const maxFrames = settings.animationDuration * settings.fps;

    const isRenderFunction = typeof root === 'function';
    const isAnimated = maxFrames > 0;

    if (isAnimated && !isRenderFunction) {
      throw new Error(
        'VersoCanvas: Animated sketches must be passed a render function as a child.'
      );
    }

    useEffect(() => {
      if (canvasRef.current) {
        const startDrawloop = () => {
          drawloop({
            fps: settings.fps,
            maxFrames,
            onFrame: ({ frame, time, playhead }) => {
              canvasRef.current.replaceChildren();
              const renderTree = isRenderFunction
                ? root({ frame, time, playhead })
                : root;
              renderToCanvas(renderTree, canvasRef.current);
            },
            onDone: () => {
              if (settings.loop) startDrawloop();
            },
          });
        };

        startDrawloop();
      }
    }, [canvasRef, children, isRenderFunction, maxFrames]);

    return <canvas ref={mergeRefs(externalRef, canvasRef)} {...rest} />;
  }
);
