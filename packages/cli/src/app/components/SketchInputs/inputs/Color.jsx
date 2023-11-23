import React from 'react';

export default function ColorInput({ value, onChange, ...rest }) {
  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
