import { renderNodeWithRenderer } from '../render.js';
import { normalizeChildren } from '../utils.js';
import {
  getTransformationMatrix,
  invertTransformationMatrix,
  parseTransform,
} from '../transform.js';

const Group = ({ children, style, transform }, renderer) => {
  const matrix = getTransformationMatrix(parseTransform(transform));
  renderer.transform(matrix);

  normalizeChildren(children).forEach((child) => {
    renderNodeWithRenderer(
      {
        ...child,
        props: {
          ...child.props,
          style: {
            ...style,
            ...child.props.style,
          },
        },
      },
      renderer
    );
  });

  renderer.transform(invertTransformationMatrix(matrix));
};

export default Group;
