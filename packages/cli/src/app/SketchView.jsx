import React, { useEffect, useRef, useState } from 'react';
import { drawloop } from '@verso/core';
import { renderToCanvas } from '@verso/dom';

import { download } from './util/export';
import { slugify } from './util/slugify';
import { extractParameterValues, sketchName } from './util/sketch';

import Navbar from './components/Navbar';
import SketchContainer from './components/SketchContainer';
import SketchInputs from './components/SketchInputs';

export default function SketchView({ sketches }) {
  const ref = useRef(null);
  const exporter = useRef(null);

  const sketchKeys = Object.keys(sketches);

  const [currentSketchKey, setCurrentSketchKey] = useState(sketchKeys[0]);
  const currentSketch = sketches[currentSketchKey];
  const { parameters, settings, setup } = currentSketch.default;
  const title = sketchName(settings);

  const [inputs, setInputs] = useState(parameters);

  useEffect(() => {
    setInputs(parameters);
  }, [currentSketch]);

  useEffect(() => {
    if (ref.current) {
      const maxFrames = settings.animationDuration * settings.fps;
      const renderFn = setup(extractParameterValues(inputs));

      const startDrawloop = () =>
        drawloop({
          fps: settings.fps,
          maxFrames,
          onFrame: ({ frame, time, playhead }) => {
            ref.current.replaceChildren();
            const res = renderToCanvas(
              renderFn({
                frame,
                time,
                playhead,
              }),
              ref.current
            );
            exporter.current = res.export;
          },
          onDone: () => {
            if (false) startDrawloop();
          },
        });

      startDrawloop();
    }
  }, [ref, setup, inputs]);

  return (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.SketchSelect
            sketches={sketches}
            value={currentSketchKey}
            onChange={(e) => setCurrentSketchKey(e.target.value)}
          />
          {setup && (
            <Navbar.Action
              onClick={() => {
                const { data, extension, mimeType } = exporter.current?.();
                const filename = `${slugify(title)}.${extension}`;
                download(data, filename, mimeType);
              }}
            >
              ↓
            </Navbar.Action>
          )}
        </Navbar.Header>

        <Navbar.Body>
          <SketchInputs inputs={inputs} onChange={setInputs} />
        </Navbar.Body>
      </Navbar>
      {setup && (
        <SketchContainer>
          <canvas ref={ref} />
        </SketchContainer>
      )}
    </div>
  );
}
