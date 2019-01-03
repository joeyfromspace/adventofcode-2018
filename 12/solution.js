const GENERATIONS = 20;
const EMPTY_CHARACTER = '.';
const PLANT_CHARACTER = '#';

const example = `initial state: #..#.#..##......###...###

...## => #
..#.. => #
.#... => #
.#.#. => #
.#.## => #
.##.. => #
.#### => #
#.#.# => #
#.### => #
##.#. => #
##.## => #
###.. => #
###.# => #
####. => #`;

const init = (input) => {
  const state = {};

  const lines = input.split('\n');
  state.current = lines.shift().split(' ').pop().split('');
  state.configs = lines.reduce((o, ln) => {
    const [config, arr, result] = ln.split(' ');
    if (!config) return o;

    return Object.assign(o, { [config]: result });
  }, {});

  return state;
};

const getPlantCharacter = (state, idx, arr) => {
  const conf = [
    arr[idx - 2] || EMPTY_CHARACTER,
    arr[idx - 1] || EMPTY_CHARACTER,
    arr[idx] || EMPTY_CHARACTER,
    arr[idx + 1] || EMPTY_CHARACTER,
    arr[idx + 2] || EMPTY_CHARACTER,
  ].join('');

  return state.configs[conf];
};

const advance = (state) => {
  state.current = state.current.map((v, idx, arr) => getPlantCharacter(state, idx, arr));
  return state;
};

const run = (input) => {
  const state = init(example);
  // const state = init(input);

  for (let turn = 0; turn < GENERATIONS; turn++) {
    advance(state);
  }

  return state.current.reduce((sum, char, idx) => {
    if (char === PLANT_CHARACTER) {
      return sum + idx;
    }

    return sum;
  }, 0);
};

module.exports = { run };
