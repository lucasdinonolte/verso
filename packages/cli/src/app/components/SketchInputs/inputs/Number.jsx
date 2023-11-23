import React from 'react';

export default function NumberInput({ value, onChange, ...rest }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}
