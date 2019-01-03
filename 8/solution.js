const parseInput = input => input.split(' ');

const initTraversal = arr => function traverse() {
  const children = arr.shift();
  const entries = arr.shift();
  const o = { children: [], metadata: [] };

  for (let i = 0; i < children; i++) {
    o.children.push(traverse());
  }

  for (let i = 0; i < entries; i++) {
    o.metadata.push(arr.shift());
  }

  for (let i = 0; i < o.metadata.length; i++) {
    const idx = o.metadata[i] - 1;
    const child = o.children[idx];
    const value = child && child.value ? child.value : 0;
    o.value = (o.value || 0) + value;
  }

  if (!children) {
    o.value = o.metadata.reduce((sum, n) => sum + n, 0);
  }

  return o;
};

const getMetdataSum = (sum, header) => {
  if (header.children.length > 0) {
    return header.children.reduce(getMetdataSum, sum);
  } else {
    return header.metadata.reduce((sum2, n) => sum2 + n, sum);
  }
};

const run = (input) => {
  const numbs = parseInput(input)
    .map(n => Number(n));
  
  const headers = [];
  const traverse = initTraversal(numbs);
  const root = traverse();

  const metadataSum = [root].reduce(getMetdataSum, 0);

  return { metadataSum, root };
};

module.exports = { run };
