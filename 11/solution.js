const GRID_WIDTH = 300;
const GRID_HEIGHT = 300;

const getPowerLevel = (x, y, sn) => {
  let power = (x + 10) * y;
  power = power + sn;
  power = power * (x + 10);
  const whole = Math.floor(power / 1000) * 10;
  power = Math.floor(power / 100) - whole;
  return power - 5;
};

const buildGrid = (sn) => {
  const grid = [];
  for (let y = 1; y <= GRID_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 1; x <= GRID_WIDTH; x++) {
      grid[y][x] = getPowerLevel(x, y, sn);
    }
  }
  return grid;
};

const initGetGridPower = grid => (x, y, area) => {
  let sum = 0;
  if (x + area > GRID_WIDTH) return 0;
  if (y + area > GRID_HEIGHT) return 0;

  for (let y1 = y; y1 < y + area && y1 <= GRID_HEIGHT; y1++) {
    for (let x1 = x; x1 < x + area && x1 <= GRID_WIDTH; x1++) {
      sum = sum + grid[y1][x1];
    }
  }
  return sum;
};

const run = (input) => {
  const serialNumber = Number(input);
  const grid = buildGrid(serialNumber);
  const getGridPower = initGetGridPower(grid);
  let largestArea = { area: 0, biggest: { power: 0, point: grid[1][1] } };

  for (let area = 1; area <= GRID_HEIGHT; area++) {
    console.log(area);
    let biggest = { point: grid[1][1], power: 0 };
    for (let y = 1; y <= GRID_HEIGHT; y++) {
      for (let x = 1; x <= GRID_WIDTH; x++) {
        const power = getGridPower(x, y, area);
        if (power > biggest.power) {
          biggest = { point: [x, y], power };
        }
      }
    }

    if (biggest.power > largestArea.biggest.power) {
      largestArea = { area, biggest };
    }
  }

  return largestArea;
};

module.exports = { run };
