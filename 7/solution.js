const MINIMUM_STEP_DURATION = 60;
const SECONDS_PER_TICK = 1;
const STEP_ID_INDEX = 7;
const STEP_DEPENDS_ON_INDEX = 1;
const WORKER_CONCURRENCY = 5;

const every = (arr, func) => arr.filter(func).length === arr.length;

const buildStepFromLine = ln => {
  const tokens = ln.split(' ');
  const id = tokens[STEP_ID_INDEX];
  const dependsOn = tokens[STEP_DEPENDS_ON_INDEX];
  return { id, dependsOn };
};

const consolidateDependencies = (deps, step) => {
  if (!deps.get(step.id)) {
    deps.set(step.id, { id: step.id, dependsOn: [] });
  }
  const depStep = deps.get(step.id);
  depStep.dependsOn.push(step.dependsOn);
  if (!deps.get(step.dependsOn)) {
    deps.set(step.dependsOn, { id: step.dependsOn, dependsOn: [] });
  }
  return deps;
};

const parseInput = input => {
  const map = input.split('\n')
    .map(buildStepFromLine)
    .reduce(consolidateDependencies, new Map())
  
  const arr = [];
  for ([id, step] of map) {
    arr.push(step);
  }

  return arr;
};

const initIsCompleted = completed => id => !!completed.find(s => s.id === id);

const getStepDuration = id => MINIMUM_STEP_DURATION + (id.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)) + 1;

const initWorkers = concurrency => Array(concurrency).fill('Worker').map((v, idx) => `${v}:${idx + 1}`);

const run = (input) => {
  const steps = parseInput(input);
  const completed = [];
  const progress = [];
  const workers = initWorkers(WORKER_CONCURRENCY);
  const isCompleted = initIsCompleted(completed);
  const isInProgress = initIsCompleted(progress);
  const isBusy = w => !!progress.find(s => s.worker === w);
  let counter = -1;

  steps.sort((a, b) => {
    return a.id.charCodeAt(0) - b.id.charCodeAt(0);
  });

  while (completed.length < steps.length) {
    counter = counter + SECONDS_PER_TICK;

    progress.forEach((item, idx) => {
      if (counter >= item.end) {
        completed.push(item);
        progress.splice(idx, 1);
      }
    });

    for (let j = 0; j < workers.length; j++) {
      const worker = workers[j];
      const busy = isBusy(worker);

      if (!busy) {
        for (let i = 0; i < steps.length; i++) {
          const { id, dependsOn } = steps[i];
          const complete = isCompleted(id);
          const isSatisfied = every(dependsOn, isCompleted);
          const progressing = isInProgress(id);
          if (!complete && !progressing && isSatisfied) {
            progress.push({ id, start: counter, end: counter + getStepDuration(id), worker });
            break;
          }
        }
      }
    }
  }

  return { order: completed.map(step => step.id).join(''), duration: counter };
};

module.exports = { run };
