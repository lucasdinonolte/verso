import { renderNodeWithRenderer } from '../render.js';
import { normalizeChildren } from '../utils.js';
import {
  getTransformationMatrix,
  invertTransformationMatrix,
  parseTransform,
} from '../transform.js';

/**
 * Group components are used to group multiple components together.
 * They can be deeply nested and apply a transformation matrix to all
 * of their children.
 *
 * You can also set styles on a group that will be applied to all of
 * its children. Styles set on the children will override the group
 * styles.
 *
 * @example
 * <Group transform={{ translate: { x: 100, y: 100 } }}>
 *   <Rectangle x={0} y={0} width={100} height={100} />
 * </Group>
 */
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
