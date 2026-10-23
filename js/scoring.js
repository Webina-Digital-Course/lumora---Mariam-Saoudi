/**
 * LUMORA scoring engine
 * Pure functions only — no DOM, no storage, no side effects.
 *
 * Ratings are 0–10 (10 = most favourable fit).
 * Weights are integers 1–5.
 *
 * Weighted score (0–100):
 *   100 × Σ(rating / 10 × weight) / Σ(weight)
 *
 * A higher score means closer alignment with the user's own ratings and
 * priorities. It is not an objective judgement about an option.
 */

export const RATING_MIN = 0;
export const RATING_MAX = 10;
export const WEIGHT_MIN = 1;
export const WEIGHT_MAX = 5;

/**
 * Scores within this many points (out of 100) of the leading score are
 * treated as tied. We compare the unrounded values so the rule is stable
 * even when two options display the same one-decimal score.
 */
export const TIE_PRECISION = 0.05;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isFilledString = (value) => typeof value === 'string' && value.trim().length > 0;

function round(value, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function validRating(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= RATING_MIN && value <= RATING_MAX;
}

/**
 * Validate a comparison before any maths runs.
 * Missing ratings are never coerced to zero.
 *
 * @param {object} data
 * @param {{ requireRatings?: boolean }} options
 * @returns {{ valid: boolean, errors: Array<{code:string,message:string,path?:string,optionId?:string,criterionId?:string}> }}
 */
export function validateComparison(data, { requireRatings = true } = {}) {
  const errors = [];
  const add = (code, message, extra = {}) => errors.push({ code, message, ...extra });

  if (!isObject(data)) {
    return { valid: false, errors: [{ code: 'invalid-data', message: 'The comparison data is missing or malformed.' }] };
  }

  const options = Array.isArray(data.options) ? data.options : null;
  const criteria = Array.isArray(data.criteria) ? data.criteria : null;

  if (!options) {
    add('options-missing', 'Add between 2 and 4 options.');
  } else {
    if (options.length < 2 || options.length > 4) {
      add('option-count', 'A comparison needs between 2 and 4 options.');
    }
    const seen = new Set();
    options.forEach((option, index) => {
      if (!isObject(option)) {
        add('option-invalid', `Option ${index + 1} is malformed.`);
        return;
      }
      if (!isFilledString(option.name)) {
        add('option-name', `Option ${index + 1} needs a name.`, { path: `options.${index}.name` });
      }
      if (!isFilledString(option.id)) {
        add('option-id', `Option ${index + 1} needs an id.`, { path: `options.${index}.id` });
      } else if (seen.has(option.id)) {
        add('option-duplicate', `Option ${index + 1} uses a duplicate id.`, { path: `options.${index}.id` });
      } else {
        seen.add(option.id);
      }
    });
  }

  if (!criteria) {
    add('criteria-missing', 'Add at least one criterion.');
  } else {
    if (criteria.length < 1) {
      add('criteria-empty', 'Add at least one criterion.');
    }
    if (criteria.length > 12) {
      add('criteria-count', 'Keep the comparison to a maximum of 12 criteria.');
    }
    const seen = new Set();
    criteria.forEach((criterion, index) => {
      if (!isObject(criterion)) {
        add('criterion-invalid', `Criterion ${index + 1} is malformed.`);
        return;
      }
      if (!isFilledString(criterion.name)) {
        add('criterion-name', `Criterion ${index + 1} needs a name.`, { path: `criteria.${index}.name` });
      }
      if (!isFilledString(criterion.id)) {
        add('criterion-id', `Criterion ${index + 1} needs an id.`, { path: `criteria.${index}.id` });
      } else if (seen.has(criterion.id)) {
        add('criterion-duplicate', `Criterion ${index + 1} uses a duplicate id.`, { path: `criteria.${index}.id` });
      } else {
        seen.add(criterion.id);
      }
      if (!Number.isInteger(criterion.weight) || criterion.weight < WEIGHT_MIN || criterion.weight > WEIGHT_MAX) {
        add('criterion-weight', `Weight for ${criterion.name || `criterion ${index + 1}`} must be a whole number from 1 to 5.`, {
          path: `criteria.${index}.weight`,
          criterionId: criterion.id,
        });
      }
    });
  }

  if (!requireRatings) {
    return { valid: errors.length === 0, errors };
  }

  if (!isObject(data.ratings)) {
    add('ratings-missing', 'Every option needs a rating for every criterion.');
    return { valid: false, errors };
  }

  if (options && criteria) {
    options.forEach((option) => {
      if (!isObject(option) || !isFilledString(option.id)) return;
      const forOption = data.ratings[option.id];
      if (!isObject(forOption)) {
        criteria.forEach((criterion) => {
          if (!isObject(criterion) || !isFilledString(criterion.id)) return;
          add('rating-missing', `Add a rating for ${option.name || 'this option'} on ${criterion.name || 'this criterion'}.`, {
            optionId: option.id,
            criterionId: criterion.id,
          });
        });
        return;
      }
      criteria.forEach((criterion) => {
        if (!isObject(criterion) || !isFilledString(criterion.id)) return;
        const rating = forOption[criterion.id];
        if (rating === undefined || rating === null || rating === '') {
          add('rating-missing', `Add a rating for ${option.name || 'this option'} on ${criterion.name || 'this criterion'}.`, {
            optionId: option.id,
            criterionId: criterion.id,
          });
        } else if (!validRating(rating)) {
          add('rating-invalid', `The rating for ${option.name || 'this option'} on ${criterion.name || 'this criterion'} must be between 0 and 10.`, {
            optionId: option.id,
            criterionId: criterion.id,
          });
        }
      });
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate alignment scores without mutating the comparison.
 * Returns `{ ok: false, errors }` when the input is incomplete or invalid.
 */
export function calculateScores(data) {
  const validation = validateComparison(data);
  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  const totalWeight = data.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  const scores = data.options.map((option) => {
    let weightedSum = 0;
    data.criteria.forEach((criterion) => {
      const rating = data.ratings[option.id][criterion.id];
      weightedSum += (rating / 10) * criterion.weight;
    });
    const rawScore = totalWeight > 0 ? (100 * weightedSum) / totalWeight : 0;
    return {
      optionId: option.id,
      optionName: option.name,
      optionDescription: option.description || '',
      weightedSum,
      rawScore,
      score: round(rawScore, 2),
    };
  });

  return { ok: true, scores, totalWeight, precision: TIE_PRECISION };
}

/**
 * Find the leading group. An option is tied for the lead when it is within
 * TIE_PRECISION of the highest unrounded score.
 */
export function detectTies(scores, precision = TIE_PRECISION) {
  if (!Array.isArray(scores) || scores.length === 0) {
    return { isTie: false, topScore: 0, leaders: [], runnerUp: null, margin: 0, precision };
  }

  const sorted = [...scores].sort((a, b) => b.rawScore - a.rawScore);
  const top = sorted[0];
  const leaders = sorted.filter((entry) => top.rawScore - entry.rawScore <= precision + Number.EPSILON);
  const outside = sorted.filter((entry) => top.rawScore - entry.rawScore > precision + Number.EPSILON);
  const runnerUp = outside[0] || null;

  return {
    isTie: leaders.length > 1,
    topScore: top.rawScore,
    leaders,
    runnerUp,
    margin: runnerUp ? top.rawScore - runnerUp.rawScore : 0,
    precision,
  };
}

/**
 * Describe one option's strongest and weakest dimensions.
 * "Strength" is contribution to the score (rating × weight), not rating alone.
 */
export function criterionInsights(data, optionId) {
  const option = Array.isArray(data?.options) ? data.options.find((item) => item.id === optionId) : null;
  if (!option || !Array.isArray(data.criteria) || !Array.isArray(data.options)) return null;

  const totalWeight = data.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (totalWeight <= 0) return null;

  const rows = [];
  for (const criterion of data.criteria) {
    const rating = data.ratings?.[optionId]?.[criterion.id];
    if (!validRating(rating)) return null;
    const contribution = (rating / 10) * criterion.weight;
    rows.push({
      criterionId: criterion.id,
      criterionName: criterion.name,
      weight: criterion.weight,
      rating,
      contribution,
      contributionShare: (contribution / totalWeight) * 100,
    });
  }

  const ordered = [...rows].sort(
    (a, b) =>
      b.contribution - a.contribution ||
      b.rating - a.rating ||
      String(a.criterionName).localeCompare(String(b.criterionName))
  );
  const strongest = ordered[0];
  const weakest = ordered[ordered.length - 1];
  const weightedSum = rows.reduce((sum, row) => sum + row.contribution, 0);

  return {
    optionId,
    optionName: option.name,
    totalWeight,
    weightedSum,
    score: round((100 * weightedSum) / totalWeight, 2),
    rows,
    strongest: strongest
      ? {
          ...strongest,
          description: `${strongest.criterionName} is this option's biggest contributor: ${strongest.rating}/10 at weight ${strongest.weight}.`,
        }
      : null,
    weakest: weakest
      ? {
          ...weakest,
          description: `${weakest.criterionName} is this option's smallest contributor: ${weakest.rating}/10 at weight ${weakest.weight}.`,
        }
      : null,
  };
}

/**
 * Rank criteria by how much they separate the options.
 * Weighted spread = (max rating − min rating) / 10 × weight.
 * This is expressed in points out of 100 before dividing by total weight.
 */
export function criteriaInfluence(data) {
  if (!Array.isArray(data?.options) || !Array.isArray(data?.criteria) || !isObject(data.ratings)) return [];
  const totalWeight = data.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (totalWeight <= 0) return [];

  const influence = [];
  for (const criterion of data.criteria) {
    const values = [];
    let complete = true;
    for (const option of data.options) {
      const value = data.ratings?.[option.id]?.[criterion.id];
      if (!validRating(value)) {
        complete = false;
        break;
      }
      values.push({ optionId: option.id, optionName: option.name, rating: value });
    }
    if (!complete || values.length === 0) continue;

    const max = Math.max(...values.map((entry) => entry.rating));
    const min = Math.min(...values.map((entry) => entry.rating));
    const spread = max - min;
    const weightedSpread = (spread / 10) * criterion.weight;
    const leading = values.filter((entry) => entry.rating === max).map((entry) => entry.optionName);

    influence.push({
      criterionId: criterion.id,
      criterionName: criterion.name,
      weight: criterion.weight,
      spread,
      weightedSpread: round(weightedSpread, 2),
      shareOfScale: round((weightedSpread / totalWeight) * 100, 2),
      maxRating: max,
      minRating: min,
      leadingOptions: leading,
      description:
        spread === 0
          ? `All options scored ${min}/10 here, so ${criterion.name} did not separate them.`
          : `${criterion.name} spans ${spread} rating points at weight ${criterion.weight}, creating a ${round(
              (weightedSpread / totalWeight) * 100,
              1
            )}-point share of the score range.`,
    });
  }

  return influence.sort(
    (a, b) => b.weightedSpread - a.weightedSpread || b.weight - a.weight || a.criterionName.localeCompare(b.criterionName)
  );
}

/**
 * Compare two options criterion by criterion. Weighted deltas are expressed
 * in points out of 100. Positive values favour option A.
 */
export function compareOptions(data, optionAId, optionBId) {
  if (optionAId === optionBId) return null;
  const optionA = data?.options?.find((option) => option.id === optionAId);
  const optionB = data?.options?.find((option) => option.id === optionBId);
  if (!optionA || !optionB) return null;

  const result = calculateScores(data);
  if (!result.ok) return null;

  const scoreA = result.scores.find((entry) => entry.optionId === optionAId);
  const scoreB = result.scores.find((entry) => entry.optionId === optionBId);
  if (!scoreA || !scoreB) return null;

  const rows = data.criteria.map((criterion) => {
    const aRating = data.ratings[optionAId][criterion.id];
    const bRating = data.ratings[optionBId][criterion.id];
    const deltaRating = aRating - bRating;
    const weightedDelta = (deltaRating / 10) * criterion.weight * (100 / result.totalWeight);
    return {
      criterionId: criterion.id,
      criterionName: criterion.name,
      weight: criterion.weight,
      aRating,
      bRating,
      deltaRating,
      weightedDelta: round(weightedDelta, 2),
      favours: deltaRating > 0 ? 'a' : deltaRating < 0 ? 'b' : 'tie',
    };
  });

  const advantagesA = rows.filter((row) => row.deltaRating > 0).sort((a, b) => b.weightedDelta - a.weightedDelta);
  const advantagesB = rows.filter((row) => row.deltaRating < 0).sort((a, b) => a.weightedDelta - b.weightedDelta);
  const equal = rows.filter((row) => row.deltaRating === 0);

  return {
    optionA: { id: optionA.id, name: optionA.name, score: scoreA.rawScore, displayScore: scoreA.score },
    optionB: { id: optionB.id, name: optionB.name, score: scoreB.rawScore, displayScore: scoreB.score },
    delta: round(scoreA.rawScore - scoreB.rawScore, 2),
    rows,
    advantagesA,
    advantagesB,
    equal,
  };
}

/**
 * Build the structured clarity report used by the UI.
 * Returns `{ ok: false, errors }` rather than throwing on incomplete data.
 */
export function explainResults(data) {
  const calculated = calculateScores(data);
  if (!calculated.ok) return { ok: false, errors: calculated.errors };

  const sortedScores = [...calculated.scores].sort(
    (a, b) => b.rawScore - a.rawScore || a.optionName.localeCompare(b.optionName)
  );

  const ties = detectTies(sortedScores);
  const leader = sortedScores[0];
  const second = sortedScores[1] || null;
  const runnerUp = ties.runnerUp || (second && second.optionId !== leader.optionId ? second : null);
  const comparison = runnerUp ? compareOptions(data, leader.optionId, runnerUp.optionId) : null;

  const insights = {};
  data.options.forEach((option) => {
    insights[option.id] = criterionInsights(data, option.id);
  });

  const influence = criteriaInfluence(data);
  const highWeightCriteria = [...data.criteria]
    .filter((criterion) => criterion.weight >= 4)
    .sort((a, b) => b.weight - a.weight);

  let rank = 0;
  let previous = null;
  sortedScores.forEach((entry, index) => {
    if (!previous || previous.rawScore - entry.rawScore > TIE_PRECISION + Number.EPSILON) {
      rank = index + 1;
      previous = entry;
    }
    entry.rank = rank;
  });

  const leaderNames = ties.leaders.map((entry) => entry.optionName);
  const statement = ties.isTie
    ? `${new Intl.ListFormat('en', { type: 'conjunction' }).format(leaderNames)} are effectively tied based on your ratings.`
    : `Based on your ratings, ${leader.optionName} aligns most closely with your stated priorities.`;

  const marginStatement = ties.isTie
    ? `Their weighted scores are within ${TIE_PRECISION.toFixed(2)} points of each other, so your inputs do not produce a clear leader.`
    : runnerUp
      ? `${leader.optionName} leads ${runnerUp.optionName} by ${ties.margin.toFixed(1)} points out of 100.`
      : '';

  return {
    ok: true,
    scores: calculated.scores,
    sortedScores,
    leader,
    runnerUp,
    isTie: ties.isTie,
    tiedOptions: ties.leaders,
    margin: ties.margin,
    precision: TIE_PRECISION,
    totalWeight: calculated.totalWeight,
    statement,
    marginStatement,
    insights,
    influence,
    highWeightCriteria,
    comparison,
    note: 'A score reflects only the criteria, weights, and ratings you supplied. It supports your judgement — it does not make the decision for you.',
  };
}
