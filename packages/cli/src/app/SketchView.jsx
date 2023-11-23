import React, { useEffect, useRef, useState } from 'react';
import { renderToCanvas, renderToSVG } from '@verso/dom';

import { download } from './util/export';
import { slugify } from './util/slugify';
import { extractInputs, sketchInputs, sketchName } from './util/sketch';

import Navbar from './components/Navbar';
import SketchContainer from './components/SketchContainer';
import SketchInputs from './components/SketchInputs';

export default function SketchView({ sketches }) {
  const ref = useRef(null);
  const exporter = useRef(null);

  const sketchKeys = Object.keys(sketches);

  const [currentSketchKey, setCurrentSketchKey] = useState(sketchKeys[0]);

  const currentSketch = sketches[currentSketchKey];
  const [inputs, setInputs] = useState(sketchInputs(currentSketch));

  const title = sketchName(currentSketch);
  const Sketch = currentSketch.default;

  useEffect(() => {
    setInputs(sketchInputs(currentSketch));
  }, [currentSketch]);

  useEffect(() => {
    if (ref.current) {
      ref.current.replaceChildren();
      const res = renderToCanvas(Sketch(extractInputs(inputs)), ref.current);
      exporter.current = res.export;
    }
  }, [ref, Sketch, inputs]);

  return (
    <div>
      <Navbar>
        <Navbar.Header>
          <Navbar.SketchSelect
            sketches={sketches}
            value={currentSketchKey}
            onChange={(e) => setCurrentSketchKey(e.target.value)}
          />
          {Sketch && (
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
      {Sketch && (
        <SketchContainer>
          <div ref={ref} />
        </SketchContainer>
      )}
    </div>
  );
}
