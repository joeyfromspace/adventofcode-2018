/**
 * Scaffold advent of code data
 * 
 * Usage: node register.js <day>
 * 
 */
const async = require('async');
const fs = require('fs');
const { request } = require('https');
const { JSDOM } = require('jsdom');
const jq = require('jquery');

const SESSION_ID = '53616c7465645f5f554a7719ff77b51a1a0dcb71b69b764260c1288b1d45e1c71d6e0cebb5fb3c6398e28c72799560d2';
const ADVENT_OF_CODE_URL = 'https://adventofcode.com';
const YEAR = '2018';
const SELECTOR = 'body main article';
const SOLUTION_TEMPLATE = `const run = (input) => true;

module.exports = { run };
`;

const constructProblemUrl = day => `${ADVENT_OF_CODE_URL}/${YEAR}/day/${day}`;
const constructInputUrl = day => `${constructProblemUrl(day)}/input`;

const makeRequest = (url, callback) => {
  const req = request(url, (res) => {
    let body = '';

    if (res.statusCode !== 200) {
      return callback(new Error(`received status code ${res.statusCode}`));
    }

    res.on('data', (chunk) => {
      body = body + chunk.toString('utf8');
    });

    res.on('end', () => callback(null, body));
  });

  req.on('error', callback);
  req.setHeader('Accept', 'text/html;');
  req.setHeader('Cookie', `session=${SESSION_ID}`);
  req.end();
}

const getProblem = (day, callback) => {
  makeRequest(constructProblemUrl(day), (err, html) => {
    if (err) return callback(err);
    const win = new JSDOM(html).window;
    const $ = jq(win);

    const questionTxt = $(SELECTOR).text();
    return callback(null, questionTxt);
  });
}

const getInput = (day, callback) => makeRequest(constructInputUrl(day), callback);

const scaffoldDay = (params, callback) => {
  const { input, problem, day } = params;
  async.auto({
    folder: (cb) => fs.mkdir(`./${day}`, cb),
    solution: ['folder', (results, cb) => fs.writeFile(`./${day}/solution.js`, SOLUTION_TEMPLATE, 'utf8', cb)],
    input: ['folder', (results, cb) => fs.writeFile(`./${day}/input.txt`, input, 'utf8', cb)],
    question: ['folder', (results, cb) => fs.writeFile(`./${day}/question.txt`, problem, 'utf8', cb)],
  }, callback);
};

const run = (day, callback) => {
  console.log(`Getting problem for day ${day}`);
  async.auto({
    problem: cb => getProblem(day, cb),
    input: cb => getInput(day, cb),
    scaffold: ['problem', 'input', (results, cb) => {
      const { input, problem } = results;
      scaffoldDay({ day, input, problem }, cb);
    }]
  }, callback);
}

const { argv } = process;
const day = argv[2];

run(day, (err) => {
  if (err) {
    console.error(`Failed to prep day ${day}: ${err.message}`);
    return;
  }
  console.log(`Completed scaffolding day ${day}`);
});
