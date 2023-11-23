import React from 'react';
import ReactDOM from 'react-dom/client';
import SketchView from './SketchView.jsx';

import './styles/reset.css';
import './styles/fonts.css';
import './styles/variables.css';
import './styles/global.css';

const sketches = import.meta.glob('@sketches/*.jsx', { eager: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <SketchView sketches={sketches} />
);
