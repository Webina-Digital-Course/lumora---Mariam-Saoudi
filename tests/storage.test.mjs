import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createId,
  sanitizeDecision,
  sanitizeDraft,
  saveDecision,
  readDecisions,
  getDecision,
  deleteDecision,
  duplicateDecision,
  saveDraft,
  loadDraft,
  clearDraft,
  saveTheme,
  loadTheme,
  isAvailable,
} from '../js/storage.js';

function makeDecision(overrides = {}) {
  return {
    version: 1,
    id: createId('test'),
    title: 'A complete decision',
    description: 'Used by the storage tests.',
    options: [
      { id: 'opt_a', name: 'Alpha', description: '' },
      { id: 'opt_b', name: 'Beta', description: '' },
    ],
    criteria: [
      { id: 'crit_cost', name: 'Cost', weight: 4 },
      { id: 'crit_fit', name: 'Fit', weight: 5 },
    ],
    ratings: {
      opt_a: { crit_cost: 7, crit_fit: 8 },
      opt_b: { crit_cost: 4, crit_fit: 9 },
    },
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    completedAt: '2025-01-02T00:00:00.000Z',
    ...overrides,
  };
}

test('reports storage availability as a boolean', () => {
  assert.equal(typeof isAvailable(), 'boolean');
});

test('saves, reads and retrieves a complete decision', () => {
  const input = makeDecision();
  const saved = saveDecision(input);
  assert.equal(saved.ok, true);
  assert.equal(saved.decision.id, input.id);
  assert.equal(saved.decision.title, input.title);
  assert.equal(typeof saved.persistent, 'boolean');

  const read = readDecisions();
  assert.equal(read.ok, true);
  const found = read.decisions.find((entry) => entry.id === input.id);
  assert.ok(found);
  assert.equal(found.options.length, 2);
  assert.equal(found.ratings.opt_b.crit_fit, 9);

  const single = getDecision(input.id);
  assert.equal(single.ok, true);
  assert.equal(single.decision.id, input.id);
});

test('rejects incomplete or invalid decisions before writing', () => {
  const incomplete = makeDecision({ ratings: { opt_a: { crit_cost: 7 } } });
  assert.equal(saveDecision(incomplete).ok, false);

  const noTitle = makeDecision({ title: '   ' });
  assert.equal(saveDecision(noTitle).ok, false);

  const unknownRating = makeDecision();
  unknownRating.ratings.opt_a.crit_fit = 99;
  assert.equal(saveDecision(unknownRating).ok, false);

  assert.equal(sanitizeDecision(null), null);
  assert.equal(sanitizeDecision({ ...makeDecision(), options: [] }), null);
});

test('sanitizes text, identifiers, timestamps and ratings', () => {
  const messy = makeDecision({
    id: 'test_clean',
    title: '  Trimmed title  ',
    description: 'x'.repeat(900),
    createdAt: 'not a date',
    options: [
      { id: 'opt_a', name: '  Alpha  ', description: '  ' },
      { id: 'opt_b', name: 'Beta' },
    ],
  });
  const clean = sanitizeDecision(messy);
  assert.ok(clean);
  assert.equal(clean.title, 'Trimmed title');
  assert.equal(clean.description.length, 600);
  assert.equal(clean.options[0].name, 'Alpha');
  assert.equal(clean.options[1].description, '');
  assert.match(clean.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('rejects duplicate option and criterion ids', () => {
  const duplicateOptions = makeDecision();
  duplicateOptions.options[1].id = 'opt_a';
  assert.equal(sanitizeDecision(duplicateOptions), null);

  const duplicateCriteria = makeDecision();
  duplicateCriteria.criteria[1].id = 'crit_cost';
  assert.equal(sanitizeDecision(duplicateCriteria), null);
});

test('updating keeps one record and preserves the original creation time', () => {
  const input = makeDecision();
  const first = saveDecision(input);
  assert.equal(first.ok, true);

  const update = {
    ...input,
    title: 'Updated title',
    ratings: {
      opt_a: { crit_cost: 10, crit_fit: 10 },
      opt_b: { crit_cost: 1, crit_fit: 1 },
    },
  };
  const second = saveDecision(update);
  assert.equal(second.ok, true);
  assert.equal(second.decision.createdAt, input.createdAt);
  assert.notEqual(second.decision.updatedAt, input.updatedAt);
  assert.equal(second.decision.title, 'Updated title');

  const matching = readDecisions().decisions.filter((entry) => entry.id === input.id);
  assert.equal(matching.length, 1);
  assert.equal(matching[0].ratings.opt_a.crit_cost, 10);
});

test('duplicates a saved decision with a unique title and new ids', () => {
  const input = makeDecision({ title: 'Duplicate me' });
  saveDecision(input);
  const duplicate = duplicateDecision(input.id);
  assert.equal(duplicate.ok, true);
  assert.notEqual(duplicate.decision.id, input.id);
  assert.match(duplicate.decision.title, /\(copy\)/);
  assert.deepEqual(duplicate.decision.options, input.options);
  assert.notEqual(duplicate.decision.ratings.opt_a, input.ratings.opt_a);

  const secondCopy = duplicateDecision(input.id);
  assert.match(secondCopy.decision.title, /\(copy 2\)/);
});

test('supports a localized copy label and strips older markers', () => {
  const input = makeDecision({ title: 'Localized copy marker' });
  saveDecision(input);
  const first = duplicateDecision(input.id, 'نسخة');
  assert.equal(first.ok, true);
  assert.equal(first.decision.title, 'Localized copy marker (نسخة)');

  const second = duplicateDecision(first.decision.id, 'نسخة');
  assert.equal(second.ok, true);
  assert.equal(second.decision.title, 'Localized copy marker (نسخة 2)');
});

test('duplicating an unknown id fails cleanly', () => {
  const result = duplicateDecision('missing_id');
  assert.equal(result.ok, false);
  assert.match(result.error, /could not be found/i);
});

test('deletes only the requested decision', () => {
  const keep = makeDecision();
  const remove = makeDecision();
  saveDecision(keep);
  saveDecision(remove);

  const result = deleteDecision(remove.id);
  assert.equal(result.ok, true);
  assert.equal(getDecision(remove.id).decision, null);
  assert.equal(getDecision(keep.id).ok, true);
  assert.equal(deleteDecision(remove.id).ok, false);
});

test('round-trips a partial draft and clears it on request', () => {
  const draft = {
    id: 'draft_test',
    title: 'Half-finished thought',
    description: '',
    options: [
      { id: 'opt_one', name: 'First', description: '' },
      { id: 'opt_two', name: '', description: '' },
    ],
    criteria: [{ id: 'crit_one', name: 'Only criterion', weight: 9 }],
    ratings: { opt_one: { crit_one: 6 } },
    createdAt: '2025-05-01T10:00:00.000Z',
    updatedAt: '2025-05-01T10:00:00.000Z',
  };

  assert.equal(saveDraft(draft).ok, true);
  const loaded = loadDraft();
  assert.equal(loaded.ok, true);
  assert.equal(loaded.decision.title, 'Half-finished thought');
  assert.equal(loaded.decision.options.length, 2);
  assert.equal(loaded.decision.options[1].name, '');
  assert.equal(loaded.decision.criteria[0].weight, 3, 'invalid weight is normalised');
  assert.equal(loaded.decision.ratings.opt_one.crit_one, 6);

  clearDraft();
  assert.equal(loadDraft().decision, null);
});

test('sanitizeDraft tolerates malformed records but rejects emptiness', () => {
  assert.equal(sanitizeDraft(null), null);
  assert.equal(sanitizeDraft({}), null);
  assert.equal(sanitizeDraft({ options: [], criteria: [] }), null);

  const draft = sanitizeDraft({ options: [{ id: 'bad id!', name: 'X' }] });
  assert.ok(draft);
  assert.equal(draft.options.length, 1);
  assert.match(draft.options[0].id, /^opt_/);
});

test('theme persistence accepts only light or dark', () => {
  assert.equal(saveTheme('light').ok, true);
  assert.equal(loadTheme(), 'light');
  assert.equal(saveTheme('dark').ok, true);
  assert.equal(loadTheme(), 'dark');
  assert.equal(saveTheme('sepia').ok, false);
});
