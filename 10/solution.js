const async = require('async');
const fs = require('fs');

const RENDER_FILE_PREFIX = 'render';
const RENDER_FILE_EXTNAME = '.txt';
const WRITE_BACKOFF_MILLISECONDS = 3000;
const REPORTING_INTERVAL = 10;

const POINT_REGEX = /\s?(-?\d+,\s{1,2}-?\d+)/ig;
const EMPTY_CHAR = '.';
const LINE_BREAK_CHAR = '\n';
const POINT_CHAR = '#';

const X = 0;
const Y = 1;

const buildPointFromLine = (ln) => {
  const points = ln.match(POINT_REGEX);
  if (points) {
    const origin = points[0].split(', ')
      .map(s => Number(s.trim()));
    const velocity = points[1].split(', ')
      .map(s => Number(s.trim()));
    
    return { origin, velocity, position: origin };
  };
};

const parseInput = input => input.split('\n')
  .map(buildPointFromLine)
  .filter(Boolean);

const advance = data => {
  data.seconds = data.seconds + 1;
  data.lastDistance = data.greatestDistance || 0;

  for (let i = 0; i < data.points.length; i++) {
    const point = data.points[i];
    point.position[X] = point.position[X] + point.velocity[X];
    point.position[Y] = point.position[Y] + point.velocity[Y];
  }

  const leastX = Math.min(...data.points.map(p => p.position[X]));
  const leastY = Math.min(...data.points.map(p => p.position[Y]));
  const greatestX = Math.max(...data.points.map(p => p.position[X]));
  const greatestY = Math.max(...data.points.map(p => p.position[Y]));

  data.minX = leastX;
  data.minY = leastY;
  data.maxX = greatestX;
  data.maxY = greatestY;
  data.greatestDistance = data.points.reduce((lpd, cp) => {
    const distance = data.points.reduce((lp1d, cp1) => {
      const cp1d = (cp.position[X] - cp1.position[X]) + (cp.position[Y] - cp1.position[Y]);
      if (cp1d > lp1d) return cp1d;
      return lp1d;
    }, 0);

    if (distance > lpd) return distance;
    return lpd;
  }, 0);

  return data;
};

const initGetAbsolutePoint = origin => point => point - origin;

const renderLine = (stream, data, y, callback) => {
  const { maxX, minX } = data;
  const row = [];
  const pointRow = data.points.filter(p => p.position[Y] === y);

  if (!pointRow.length) {
    // console.log(`blank line ${y}, skipping...`);
    return callback(null);
  }

  // console.log(`rendering line ${y + 1} of ${data.maxY}...`);

  for (let x = minX; x <= maxX; x++) {
    const point = pointRow.find(p => p.position[X] === x);
    if (point) {
      // console.log(`point found at ${x}, ${y}`);
    }
    const char = point ? POINT_CHAR : EMPTY_CHAR;
    row.push(char);
  }

  const str = `${row.join('')}${LINE_BREAK_CHAR}`;
  const ok = stream.write(str);

  if (ok) {
    return callback(null);
  } else {
    // console.log('stream not writable, waiting for drain event...');
    stream.once('drain', () => {
      // console.log('drain received...');
      return setTimeout(() => callback(null), WRITE_BACKOFF_MILLISECONDS);
    });
  }
};

const render = (data, callback) => {
  const { seconds, maxY, minY } = data;
  const outfile = `${RENDER_FILE_PREFIX}-${seconds}${RENDER_FILE_EXTNAME}`;
  const writeStream = fs.createWriteStream(outfile, 'utf8');
  let counter = minY - 1;

  console.log(`outputting results of ${seconds}... ${maxY}`);

  async.whilst(() => counter < maxY, (cb) => {
    counter = counter + 1;
    console.log(counter, maxY);
    renderLine(writeStream, data, counter, cb);
  },
    (err) => {
      console.log('done!');
      writeStream.end();
      if (err) return callback(err);
      return callback(null, outfile);
  });
};

const renderLoop = (data, callback) => {
  async.whilst(() => data.greatestDistance < data.lastDistance, (cb) => {
    render(data, (err) => {
      if (err) return cb(err);
      advance(data);
      return cb();
    });
  }, callback);
};

const run = (input) => {
  const points = parseInput(input);
  const minX = Math.min(...points.map(p => p.origin[X]));
  const minY = Math.min(...points.map(p => p.origin[Y]));
  const getAbsoluteY = initGetAbsolutePoint(minY);
  const getAbsoluteX = initGetAbsolutePoint(minX);

  const data = {
    points,
    seconds: 0,
    greatestAllowableDistance: points.length ** 2,
  }

  data.points = points.map(p => {
    p.position = [getAbsoluteX(p.origin[X]), getAbsoluteY(p.origin[Y])];
    return p;
  });

  data.maxX = Math.max(...data.points.map(p => p.position[X]));
  data.maxY = Math.max(...data.points.map(p => p.position[Y]));

  do {
    if (data.seconds % REPORTING_INTERVAL === 0) {
      // console.log(`reached interval ${data.seconds} with greatest distance of ${data.greatestDistance}`);
      // console.log(`greatest allowable distance: ${data.greatestAllowableDistance}`);
    }
    advance(data);
  } while (data.maxY - data.minY > data.points.length);

  renderLoop(data, (err) => {
    if (err) console.error(err);
    console.log('done');
  });
};

module.exports = { run };
