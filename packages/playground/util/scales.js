export const makeFibonacciScale = (n, start = 1) => {
  const scale = [];
  let a = 0;
  let b = start;
  for (let i = 0; i < n; i++) {
    const c = a + b;
    scale.push(c);
    a = b;
    b = Math.max(c, 1);
  }

  return scale;
};

export const normalizeNumberArray = (arr) => {
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return arr.map((val) => val / sum);
};
