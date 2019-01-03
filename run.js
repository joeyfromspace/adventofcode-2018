const fs = require('fs');

const { argv } = process;
const DAY = argv[2];

const getInput = n => fs.readFileSync(`./${n}/input.txt`, 'utf8');

const getFunc = n => require(`./${n}/solution.js`);

const input = getInput(DAY);
const func = getFunc(DAY);

console.log(`Running solution for day ${DAY}...`);

const answer = func.run(input);

console.log('Answer: ', answer);
