import ColorInput from './Color';
import NumberInput from './Number';

const inputs = {
  color: {
    component: ColorInput,
    format: (value) => value,
  },
  number: {
    component: NumberInput,
    format: (value) => Number(value),
  },
};

export default inputs;
