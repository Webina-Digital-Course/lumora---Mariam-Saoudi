import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateComparison,
  calculateScores,
  detectTies,
  criterionInsights,
  criteriaInfluence,
  compareOptions,
  explainResults,
  TIE_PRECISION,
  RATING_MIN,
  RATING_MAX,
  WEIGHT_MIN,
  WEIGHT_MAX,
} from '../js/scoring.js';

function comparison(overrides = {}) {
  return {
    title: 'Test decision',
    options: [
      { id: 'a', name: 'Option A', description: '' },
      { id: 'b', name: 'Option B', description: '' },
    ],
    criteria: [
      { id: 'c1', name: 'Cost', weight: 5 },
      { id: 'c2', name: 'Time', weight: 1 },
    ],
    ratings: {
      a: { c1: 8, c2: 2 },
      b: { c1: 10, c2: 0 },
    },
    ...overrides,
  };
}

test('exposes documented rating and weight ranges', () => {
  assert.equal(RATING_MIN, 0);
  assert.equal(RATING_MAX, 10);
  assert.equal(WEIGHT_MIN, 1);
  assert.equal(WEIGHT_MAX, 5);
  assert.equal(TIE_PRECISION, 0.05);
});

test('calculates the documented weighted formula', () => {
  const result = calculateScores(comparison());
  assert.equal(result.ok, true);
  assert.equal(result.totalWeight, 6);

  const a = result.scores.find((entry) => entry.optionId === 'a');
  const b = result.scores.find((entry) => entry.optionId === 'b');

  // 100 * ((8/10)*5 + (2/10)*1) / 6 = 70
  assert.equal(a.score, 70);
  // 100 * ((10/10)*5 + (0/10)*1) / 6 = 83.33...
  assert.ok(Math.abs(b.score - 83.33) < 0.001);
  assert.ok(Math.abs(a.weightedSum - 4.2) < 1e-12);
});

test('a rating of zero is valid and is never treated as missing', () => {
  const data = comparison();
  assert.equal(validateComparison(data).valid, true);
  const result = calculateScores(data);
  assert.equal(result.ok, true);
  assert.equal(result.scores.find((entry) => entry.optionId === 'b').score > 80, true);
});

test('missing ratings invalidate the comparison without coercion to zero', () => {
  const data = comparison();
  delete data.ratings.a.c2;
  const validation = validateComparison(data);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.code === 'rating-missing' && error.optionId === 'a'));
  const result = calculateScores(data);
  assert.equal(result.ok, false);
});

test('rejects out-of-range ratings, bad weights, duplicate ids and wrong option counts', () => {
  const cases = [
    (() => {
      const data = comparison();
      data.ratings.a.c1 = 11;
      return data;
    })(),
    (() => {
      const data = comparison();
      data.criteria[0].weight = 0;
      return data;
    })(),
    (() => {
      const data = comparison();
      data.criteria[0].weight = 2.5;
      return data;
    })(),
    (() => {
      const data = comparison();
      data.options[1].id = 'a';
      return data;
    })(),
    (() => {
      const data = comparison();
      data.options = data.options.slice(0, 1);
      return data;
    })(),
  ];

  for (const data of cases) {
    const validation = validateComparison(data);
    assert.equal(validation.valid, false);
  }
});

test('allows setup validation before ratings exist', () => {
  const data = comparison({ ratings: {} });
  const validation = validateComparison(data, { requireRatings: false });
  assert.equal(validation.valid, true);
  assert.equal(validateComparison(data).valid, false);
});

test('tie detection compares unrounded scores with a 0.05 point margin', () => {
  const tied = detectTies([
    { optionId: 'a', optionName: 'A', rawScore: 50 },
    { optionId: 'b', optionName: 'B', rawScore: 49.96 },
  ]);
  assert.equal(tied.isTie, true);
  assert.equal(tied.leaders.length, 2);
  assert.equal(tied.runnerUp, null);

  const split = detectTies([
    { optionId: 'a', optionName: 'A', rawScore: 50 },
    { optionId: 'b', optionName: 'B', rawScore: 49.94 },
  ]);
  assert.equal(split.isTie, false);
  assert.equal(split.leaders.length, 1);
  assert.equal(split.runnerUp.optionId, 'b');
  assert.ok(Math.abs(split.margin - 0.06) < 1e-9);
});

test('detectTies handles empty input safely', () => {
  const result = detectTies([]);
  assert.equal(result.isTie, false);
  assert.deepEqual(result.leaders, []);
  assert.equal(result.runnerUp, null);
});

test('a genuine tie is reported without inventing a winner', () => {
  const data = comparison({
    ratings: {
      a: { c1: 5, c2: 5 },
      b: { c1: 5, c2: 5 },
    },
  });
  const result = explainResults(data);
  assert.equal(result.ok, true);
  assert.equal(result.isTie, true);
  assert.equal(result.tiedOptions.length, 2);
  assert.match(result.statement, /tied/i);
  assert.match(result.marginStatement, /within 0.05 points/i);
  assert.equal(result.leader.score, result.tiedOptions[1].score);
});

test('ranks tied leaders equally and ranks the next option after them', () => {
  const data = {
    options: [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ],
    criteria: [{ id: 'c1', name: 'Only', weight: 5 }],
    ratings: {
      a: { c1: 8 },
      b: { c1: 8 },
      c: { c1: 2 },
    },
  };
  const result = explainResults(data);
  const byId = Object.fromEntries(result.sortedScores.map((entry) => [entry.optionId, entry]));
  assert.equal(result.isTie, true);
  assert.equal(byId.a.rank, 1);
  assert.equal(byId.b.rank, 1);
  assert.equal(byId.c.rank, 3);
});

test('describes strongest and weakest contributions rather than raw ratings', () => {
  const insights = criterionInsights(comparison(), 'a');
  assert.equal(insights.strongest.criterionId, 'c1');
  assert.equal(insights.strongest.contribution, 4);
  assert.equal(insights.weakest.criterionId, 'c2');
  assert.equal(insights.weakest.contribution, 0.2);
  assert.ok(insights.strongest.contribution > insights.weakest.contribution);
});

test('criteria influence is sorted by weighted spread', () => {
  const influence = criteriaInfluence(comparison());
  assert.equal(influence[0].criterionId, 'c1');
  assert.equal(influence[0].spread, 2);
  assert.equal(influence[0].weightedSpread, 1);
  assert.equal(influence[1].criterionId, 'c2');
  assert.equal(influence[1].weightedSpread, 0.2);
});

test('pairwise comparison deltas add up to the score difference', () => {
  const data = comparison();
  const pair = compareOptions(data, 'b', 'a');
  assert.ok(pair);
  const sum = pair.rows.reduce((total, row) => total + row.weightedDelta, 0);
  assert.ok(Math.abs(sum - (pair.optionA.score - pair.optionB.score)) < 0.011);
  assert.equal(pair.advantagesA.length, 1);
  assert.equal(pair.advantagesB.length, 1);
  assert.equal(pair.advantagesA[0].criterionId, 'c1');
  assert.equal(pair.advantagesB[0].criterionId, 'c2');
  assert.equal(compareOptions(data, 'a', 'a'), null);
});

test('explainResults returns a complete report shape', () => {
  const result = explainResults(comparison());
  assert.equal(result.ok, true);
  assert.equal(result.leader.optionId, 'b');
  assert.equal(result.runnerUp.optionId, 'a');
  assert.ok(result.margin > 0);
  assert.equal(result.totalWeight, 6);
  assert.ok(Object.keys(result.insights).length === 2);
  assert.ok(result.influence.length === 2);
  assert.ok(result.highWeightCriteria.every((criterion) => criterion.weight >= 4));
  assert.match(result.note, /does not make the decision for you/i);
});

test('explainResults fails softly on invalid input', () => {
  const result = explainResults(null);
  assert.equal(result.ok, false);
  assert.ok(Array.isArray(result.errors));
  assert.equal(result.leader, undefined);
});

test('the formula scales each option to a 0–100 range', () => {
  const data = comparison({
    criteria: [{ id: 'c1', name: 'Single', weight: 3 }],
    ratings: { a: { c1: 10 }, b: { c1: 0 } },
  });
  const result = explainResults(data);
  assert.equal(result.scores.find((entry) => entry.optionId === 'a').score, 100);
  assert.equal(result.scores.find((entry) => entry.optionId === 'b').score, 0);
});
