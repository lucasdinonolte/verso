import React from 'react';

import css from './SketchContainer.module.css';

export default function SketchContainer({ children }) {
  return (
    <div className={css.root}>
      <div className={css.canvas}>{children}</div>
    </div>
  );
}
