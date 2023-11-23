import React from 'react';
import inputComponents from './inputs';

import css from './SketchInputs.module.css';

export default function SketchInputs({ inputs, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({ ...inputs, [key]: { ...inputs[key], value } });
  };

  return (
    <div className={css.root}>
      {Object.entries(inputs).map(
        ([key, { type, value, label, hint, ...rest }]) => {
          const typeComponent = inputComponents[type];

          if (!typeComponent) {
            return <div key={key}>Unknown input type {type}</div>;
          }

          const { format, component } = typeComponent;
          const InputComponent = component;

          const displayLabel = label ?? key;

          return (
            <div key={key} className={css.input}>
              <label className={css.label} htmlFor={key}>
                {displayLabel}
              </label>
              <InputComponent
                {...rest}
                id={key}
                value={value}
                onChange={(value) => handleUpdate(key, format(value))}
              />
            </div>
          );
        }
      )}
    </div>
  );
}
