export const mergeRefs = (...refs) => {
  return (node) => {
    for (const ref of refs) {
      if (ref) {
        ref.current = node;
      }
    }
  };
};
