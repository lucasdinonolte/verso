import { useEffect, useState } from 'react';
import { Verso } from '@verso/react';
import {
  download,
  exportToPNG,
  exportToJPG,
  exportToSVG,
  exportToMP4,
} from '@verso/dom';
import {
  registerImage,
  registerFont,
  Canvas,
  Group,
  Image,
  Rectangle,
  Text,
} from '@verso/core';

const settings = {
  animationDuration: 5,
};

function Sketch({ color, font, text, image }) {
  return ({ playhead }) => {
    if (!image) return null;
    const colW = 1024 / (image?.width ?? 1);
    const colors = Array.from({ length: image.width }).map((_, i) =>
      image.getPixel(i, 0)
    );

    return (
      <Canvas width={1024} height={1024} density={1}>
        {image &&
          colors.map((c, i) => {
            const t =
              Math.sin(playhead * Math.PI * 8 + i * Math.PI * 0.0125) * 0.5 +
              0.5;
            return (
              <Rectangle
                key={i}
                x={colW * i}
                y={0}
                width={colW}
                height={1024 * t}
                style={{ fill: `rgb(${c.r}, ${c.g}, ${c.b})` }}
              />
            );
          })}
      </Canvas>
    );
  };
}

function App() {
  const [count, setCount] = useState(100);
  const [text, setText] = useState(
    'Die Schwanenblume (Butomus umbellatus) ist die einzige Pflanzen­art in der mono­typi­schen Gattung Butomus und der mono­generi­schen Familie der Schwanen­blumen­ge­wächse (Butomaceae). Sie gedeiht als Sumpf­pflanze an Gewässer­ufern und in Feucht­gebieten. Der Trivial­name „Schwanen­blume“ bezieht sich wohl auf die Form der Frucht­knoten mit ihrer schwanen­hals­artigen Verlänge­rung. Das Rhizom der Schwanen­blume, das bis zu 60 Pro­zent Stärke ent­hält, ist essbar. In Asien wird diese unter­irdische, bewur­zelte Spross­achse gelegent­lich getrock­net zu Mehl verar­beitet. Bei den Kirgi­sen, Kalmücken und Jakuten wird das Rhizom in Asche gebacken und wie Brot verwen­det. In Mittel­europa wurden die Wurzel­stöcke während Not­zeiten gleich­falls geges­sen'
  );
  const [color, setColor] = useState('#ff0000');
  const [font, setFont] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const loadFont = async () => {
      const res = await fetch('/apercu.otf');
      const fontData = await res.arrayBuffer();
      const font = registerFont(fontData);

      setFont(font);
    };

    const loadImage = async () => {
      const res = await fetch('/img.png');
      const imgData = await res.arrayBuffer();
      const img = await registerImage(imgData);
      const cropped = await img.resize({
        width: 24,
      });

      setImage(cropped);
    };

    loadImage();
    loadFont();
  }, []);

  const props = { count, color, font, text, image };

  const handlePNGExport = () => {
    const { data, extension, mimeType } = exportToPNG(Sketch(props));
    download(data, `sketch.${extension}`, mimeType);
  };

  const handleJPGExport = () => {
    const { data, extension, mimeType } = exportToJPG(Sketch(props));
    download(data, `sketch.${extension}`, mimeType);
  };

  const handleSVGExport = () => {
    const { data, extension, mimeType } = exportToSVG(Sketch(props));
    download(data, `sketch.${extension}`, mimeType);
  };

  const handleMP4Export = async () => {
    const { data, extension, mimeType } = await exportToMP4(
      Sketch(props),
      settings
    );
    download(data, `sketch.${extension}`, mimeType);
  };

  return (
    <div>
      <input
        type="number"
        value={count}
        step={10}
        onChange={(e) => setCount(e.target.value)}
      />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <button onClick={handlePNGExport}>Export PNG</button>
      <button onClick={handleJPGExport}>Export JPG</button>
      <button onClick={handleSVGExport}>Export SVG</button>
      <button onClick={handleMP4Export}>Export MP4</button>

      <div>
        <Verso settings={settings}>
          <Sketch {...props} />
        </Verso>
      </div>
    </div>
  );
}

export default App;
