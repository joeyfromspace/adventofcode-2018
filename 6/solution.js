const MAX_SAFE_DISTANCE = 10000;

const parseInput = input => input
  .split('\n')
  .map(ln => ln.split(', ').map(n => Number(n)))
  .map(([x, y], idx) => ({ x, y, id: `Point:${1 + idx}` }));

const getDistance = ([x, y], [x2, y2]) => Math.abs((x - x2)) + Math.abs((y - y2))
const getAxisValues = idx => coords => coords.map(xy => xy[idx]);
const getXValues = getAxisValues('x');
const getYValues = getAxisValues('y');

const initGetClosestPoint = (coords) => (x, y) => {
  const distances = coords
    .map(xy => Object.assign({}, xy, { distance: getDistance([xy.x, xy.y], [x, y]) }))
    .reduce((arr, xy) => {
      const lastClosestDistance = arr[0] && arr[0].distance;
      if (typeof lastClosestDistance !== 'number' || xy.distance === lastClosestDistance) {
        arr.push(xy);
      } else if (xy.distance < lastClosestDistance) {
        return [xy];
      }

      return arr;
    }, []);
  
  if (distances.length === 1) {
    return distances.shift();
  }

  return null;
};

const initIsInRegion = (coords, safeDistance) => (x, y) => coords.reduce((sum, xy) => sum + getDistance([xy.x, xy.y], [x, y]), 0) < safeDistance;

const initIsContested = (rangeX, rangeY, coords) => (x, y) => x > rangeX[0] && x < rangeX[1] && y > rangeY[0] && y < rangeY[1];

const initScore = (scores, id) => {
  scores[id] = { contested: true, score: 0 };
};

const run = (input) => {
  const coords = parseInput(input);
  const xAxis = getXValues(coords);
  const yAxis = getYValues(coords);
  const maxX = Math.max(...xAxis);
  const maxY = Math.max(...yAxis);
  const getClosestPoint = initGetClosestPoint(coords);
  const isInRegion = initIsInRegion(coords, MAX_SAFE_DISTANCE);
  const isContested = initIsContested([0, maxX], [0, maxY], coords);

  const scores = {};
  let regionSize = 0;

  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= maxX; x++) {
      const closest = getClosestPoint(x, y);
      const inRegion = isInRegion(x, y);
      const contested = isContested(x, y);

      if (inRegion && contested) {
        regionSize = regionSize + 1;
      }

      if (closest) {
        if (!scores[closest.id]) initScore(scores, closest.id);
        const scoreObj = scores[closest.id];
        if (contested && scoreObj.contested === true) {
          scoreObj.score = scoreObj.score + 1;
        } else {
          scoreObj.contested = false;
        }
      }
    }
  }

  const highestScore = Object.keys(scores)
    .reduce((lastId, id) => {
      const lastScore = scores[lastId].score;
      const { score, contested } = scores[id];

      if (contested === true && score > lastScore) {
        return id;
      }

      return lastId;
    });
  
  return { id: highestScore, score: scores[highestScore], regionSize };
};

module.exports = { run };
