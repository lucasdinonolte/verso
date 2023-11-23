import React from 'react';

import css from './Navbar.module.css';

export default function Navbar({ children }) {
  return <nav className={css.root}>{children}</nav>;
}

Navbar.Header = ({ children }) => <div className={css.header}>{children}</div>;

Navbar.Action = ({ children, ...rest }) => {
  return (
    <button className={css.action} {...rest}>
      {children}
    </button>
  );
};

Navbar.Body = ({ children }) => <div className={css.body}>{children}</div>;

Navbar.SketchSelect = ({ sketches, value, onChange }) => {
  return (
    <select className={css.select} value={value} onChange={onChange}>
      {Object.entries(sketches).map(([key, sketch]) => (
        <option key={key} value={key}>
          {sketch.title ?? 'Untitled Sketch'}
        </option>
      ))}
    </select>
  );
};
