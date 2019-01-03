const _ = require('lodash');

const PLAYER_COUNT = 446;
const LAST_MARBLE_VALUE = 7152200;
const EMPTY_ELEMENT = null;

const TURN_ACTIONS = {
  PLACE_MARBLE: (state) => {
    let position = state.insertedMarbles === 1 ? 1 : (state.position + 2) % state.insertedMarbles;
    let nextValue;
    let currentValue;

    if (position === 0) {
      position = state.insertedMarbles;
    } else {

      for (let i = position; i < state.insertedMarbles; i++) {
        if (!nextValue) {
          nextValue = state.circle[i];
        } else {
          currentValue = state.circle[i];
          state.circle[i] = nextValue;
          nextValue = currentValue;
        }
      }
    }

    state.circle[position] = state.marble;
    state.insertedMarbles = state.insertedMarbles + 1;
    state.position = position;
    return state;
  },
  TAKE_MARBLES: (state) => {
    let echoMarbleIdx = state.position - 7;
    const scoreKey = state.player - 1;
    
    if (echoMarbleIdx < 0) {
      echoMarbleIdx = state.insertedMarbles + echoMarbleIdx;
    }
    
    const value = state.marble + state.circle[echoMarbleIdx];
    state.scores[scoreKey] = state.scores[scoreKey] + value;

    for (let i = echoMarbleIdx; i < state.insertedMarbles; i++) {
      state.circle[i] = state.circle[i + 1];
    }

    state.insertedMarbles = state.insertedMarbles - 1;
    state.circle[state.insertedMarbles] = EMPTY_ELEMENT;
    state.position = echoMarbleIdx;

    return state;
  },
  END_GAME: (state) => {
    console.log('game over, a winner is you!');
    const highestScoringPlayer = state.scores.reduce((lastScoreKey, score, idx) => {
      const lastScore = state.scores[lastScoreKey];

      if (score > lastScore) {
        return idx;
      }

      return lastScoreKey;
    }, 0);

    state.ended = true;
    state.winner = { player: highestScoringPlayer + 1, score: state.scores[highestScoringPlayer] };
    return state;
  },
};

const turn = (state) => {
  state.turn = state.turn + 1;
  state.marble = state.marble + 1;
  state.player = ((state.player + 1) % PLAYER_COUNT) || PLAYER_COUNT;
  
  if (state.turn % 100000 === 0) {
    const runtime = Math.round((Date.now() - state.start) / 1000);
    console.log(`Executing turn ${state.turn}: runtime:${runtime}s pos:${state.position} player:${state.player}...`);
  }

  switch (true) {
    case state.marble > LAST_MARBLE_VALUE:
      return TURN_ACTIONS.END_GAME(state);
      
    case state.marble % 23 === 0:
      return TURN_ACTIONS.TAKE_MARBLES(state);
      
    default:
      return TURN_ACTIONS.PLACE_MARBLE(state);
  }
};

const run = () => {
  let marbleMultiplesOf23 = 0;

  for (let i = 1; i < LAST_MARBLE_VALUE; i++) {
    if (i % 23 === 0) {
      marbleMultiplesOf23 = marbleMultiplesOf23 + 1;
    }
  }

  const state = {
    start: Date.now(),
    circle: Array(LAST_MARBLE_VALUE - marbleMultiplesOf23).fill(EMPTY_ELEMENT),
    insertedMarbles: 1,
    position: 0,
    marble: 0,
    player: 0,
    scores: Array(PLAYER_COUNT).fill(0),
    turn: 0,
    ended: false,
  };

  state.circle[0] = 0;

  while (state.ended === false) {
    turn(state);
  }

  return state;
};

module.exports = { run };
