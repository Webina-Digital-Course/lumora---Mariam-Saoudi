
const KEYS = {
  decisions: 'lumora.decisions.v1',
  draft: 'lumora.draft.v1',
  theme: 'lumora.theme',
  language: 'lumora.lang',
};

const VERSION = 1;
const MAX_RECORDS = 100;
const MAX_OPTIONS = 4;
const MAX_CRITERIA = 12;

const memory = new Map();
let availability = null;

function store() {
  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export function isAvailable() {
  if (availability !== null) return availability;
  try {
    const target = store();
    if (!target) return (availability = false);
    const testKey = '__lumora_probe__';
    target.setItem(testKey, '1');
    target.removeItem(testKey);
    availability = true;
  } catch {
    availability = false;
  }
  return availability;
}

function readRaw(key) {
  if (isAvailable()) {
    try {
      return store().getItem(key);
    } catch {
      /* fall through to memory */
    }
  }
  return memory.has(key) ? memory.get(key) : null;
}

function writeRaw(key, value) {
  if (isAvailable()) {
    try {
      store().setItem(key, value);
      memory.delete(key);
      return { ok: true, persistent: true };
    } catch (error) {
      const code = error && (error.name === 'QuotaExceededError' || error.code === 22) ? 'quota' : 'write-failed';
      return {
        ok: false,
        persistent: false,
        code,
        error:
          code === 'quota'
            ? 'Browser storage is full. Free some space, then save again.'
            : 'The browser refused to save this data.',
      };
    }
  }

  memory.set(key, value);
  return { ok: true, persistent: false };
}

function removeRaw(key) {
  memory.delete(key);
  if (!isAvailable()) return { ok: true, persistent: false };
  try {
    store().removeItem(key);
    return { ok: true, persistent: true };
  } catch {
    return { ok: false, persistent: false, error: 'The browser refused to remove this data.' };
  }
}

function cleanText(value, maxLength, { required = false, fallback = '' } = {}) {
  if (typeof value !== 'string') return required ? null : fallback;
  const text = value.trim();
  if (required && text.length === 0) return null;
  return text.slice(0, maxLength);
}

function validTimestamp(value) {
  if (typeof value !== 'string') return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function validId(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
}

export function createId(prefix = 'dec') {
  const uuid =
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${uuid}`.slice(0, 80);
}

function sanitizeOptions(options) {
  if (!Array.isArray(options) || options.length < 2 || options.length > MAX_OPTIONS) return null;
  const seen = new Set();
  const clean = [];
  for (const option of options) {
    if (!option || typeof option !== 'object') return null;
    const id = validId(option.id) ? option.id : null;
    const name = cleanText(option.name, 80, { required: true });
    if (!id || !name || seen.has(id)) return null;
    seen.add(id);
    clean.push({
      id,
      name,
      description: cleanText(option.description, 300),
    });
  }
  return clean;
}

function sanitizeCriteria(criteria) {
  if (!Array.isArray(criteria) || criteria.length < 1 || criteria.length > MAX_CRITERIA) return null;
  const seen = new Set();
  const clean = [];
  for (const criterion of criteria) {
    if (!criterion || typeof criterion !== 'object') return null;
    const id = validId(criterion.id) ? criterion.id : null;
    const name = cleanText(criterion.name, 80, { required: true });
    const weight = criterion.weight;
    if (!id || !name || seen.has(id) || !Number.isInteger(weight) || weight < 1 || weight > 5) return null;
    seen.add(id);
    clean.push({ id, name, weight });
  }
  return clean;
}

function sanitizeRatings(ratings, options, criteria, { requireComplete = true } = {}) {
  if (!ratings || typeof ratings !== 'object' || Array.isArray(ratings)) return null;
  const clean = {};
  for (const option of options) {
    const source = ratings[option.id];
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      if (requireComplete) return null;
      clean[option.id] = {};
      continue;
    }
    clean[option.id] = {};
    for (const criterion of criteria) {
      const value = source[criterion.id];
      if (value === undefined || value === null || value === '') {
        if (requireComplete) return null;
        continue;
      }
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10) return null;
      clean[option.id][criterion.id] = value;
    }
  }
  return clean;
}

/**
 * Strictly validate a saved record. Returns a fresh object or null.
 */
export function sanitizeDecision(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  const id = validId(record.id) ? record.id : null;
  const title = cleanText(record.title, 120, { required: true });
  const options = sanitizeOptions(record.options);
  const criteria = sanitizeCriteria(record.criteria);
  if (!id || !title || !options || !criteria) return null;
  const ratings = sanitizeRatings(record.ratings, options, criteria);
  if (!ratings) return null;

  const now = new Date().toISOString();
  return {
    version: VERSION,
    id,
    title,
    description: cleanText(record.description, 600),
    options,
    criteria,
    ratings,
    createdAt: validTimestamp(record.createdAt) || now,
    updatedAt: validTimestamp(record.updatedAt) || now,
    completedAt: validTimestamp(record.completedAt) || validTimestamp(record.updatedAt) || now,
  };
}

/**
 * Lenient validation for an in-progress draft. Missing names and ratings are
 * allowed so a half-finished workspace can be restored after a reload.
 */
export function sanitizeDraft(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  const id = validId(record.id) ? record.id : createId('dec');
  const options = [];
  if (Array.isArray(record.options)) {
    const seen = new Set();
    record.options.slice(0, MAX_OPTIONS).forEach((option) => {
      if (!option || typeof option !== 'object') return;
      const optionId = validId(option.id) && !seen.has(option.id) ? option.id : createId('opt');
      seen.add(optionId);
      options.push({
        id: optionId,
        name: cleanText(option.name, 80),
        description: cleanText(option.description, 300),
      });
    });
  }
  const criteria = [];
  if (Array.isArray(record.criteria)) {
    const seen = new Set();
    record.criteria.slice(0, MAX_CRITERIA).forEach((criterion) => {
      if (!criterion || typeof criterion !== 'object') return;
      const criterionId =
        validId(criterion.id) && !seen.has(criterion.id) ? criterion.id : createId('crit');
      seen.add(criterionId);
      const weight = Number(criterion.weight);
      criteria.push({
        id: criterionId,
        name: cleanText(criterion.name, 80),
        weight: Number.isInteger(weight) && weight >= 1 && weight <= 5 ? weight : 3,
      });
    });
  }
  if (options.length === 0 && criteria.length === 0) return null;

  const ratings = {};
  for (const option of options) {
    ratings[option.id] = {};
    const source = record.ratings?.[option.id];
    if (!source || typeof source !== 'object') continue;
    for (const criterion of criteria) {
      const value = source[criterion.id];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10) {
        ratings[option.id][criterion.id] = value;
      }
    }
  }

  const now = new Date().toISOString();
  return {
    version: VERSION,
    id,
    title: cleanText(record.title, 120),
    description: cleanText(record.description, 600),
    options,
    criteria,
    ratings,
    createdAt: validTimestamp(record.createdAt) || now,
    updatedAt: validTimestamp(record.updatedAt) || now,
    completedAt: null,
  };
}

function backupCorrupt(raw) {
  try {
    const backupKey = `${KEYS.decisions}.corrupt.${Date.now()}`;
    if (isAvailable()) store().setItem(backupKey, raw);
    else memory.set(backupKey, raw);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read and validate all saved decisions.
 * Corrupted JSON is backed up before being set aside.
 */
export function readDecisions() {
  let raw;
  try {
    raw = readRaw(KEYS.decisions);
  } catch {
    return { ok: true, decisions: [], skipped: 0, persistent: isAvailable() };
  }
  if (!raw) return { ok: true, decisions: [], skipped: 0, persistent: isAvailable() };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const backedUp = backupCorrupt(raw);
    if (backedUp) writeRaw(KEYS.decisions, '[]');
    return {
      ok: false,
      decisions: [],
      skipped: 0,
      persistent: isAvailable(),
      error: backedUp
        ? 'Saved decisions were unreadable. A backup was kept and the library was reset.'
        : 'Saved decisions were unreadable and could not be backed up. Existing data was left untouched.',
    };
  }

  if (!Array.isArray(parsed)) {
    const backedUp = backupCorrupt(raw);
    if (backedUp) writeRaw(KEYS.decisions, '[]');
    return {
      ok: false,
      decisions: [],
      skipped: 0,
      persistent: isAvailable(),
      error: 'The saved-decision library had an unexpected format.',
    };
  }

  const decisions = [];
  const seen = new Set();
  let skipped = 0;
  for (const record of parsed) {
    const clean = sanitizeDecision(record);
    if (!clean || seen.has(clean.id)) {
      skipped += 1;
      continue;
    }
    seen.add(clean.id);
    decisions.push(clean);
  }

  decisions.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  return {
    ok: true,
    decisions,
    skipped,
    persistent: isAvailable(),
    error: skipped ? `${skipped} saved decision${skipped === 1 ? '' : 's'} could not be read and ${skipped === 1 ? 'was' : 'were'} skipped.` : undefined,
  };
}

function writeAll(decisions) {
  const trimmed = decisions.slice(0, MAX_RECORDS);
  const result = writeRaw(KEYS.decisions, JSON.stringify(trimmed));
  if (!result.ok) return result;
  return { ok: true, persistent: result.persistent, decisions: trimmed };
}

/** Create or update one saved decision. */
export function saveDecision(input) {
  const clean = sanitizeDecision(input);
  if (!clean) {
    return {
      ok: false,
      persistent: isAvailable(),
      error: 'This decision is incomplete or contains invalid data, so it was not saved.',
    };
  }

  const existing = readDecisions();
  const now = new Date().toISOString();
  const previous = existing.decisions.find((record) => record.id === clean.id);
  const record = {
    ...clean,
    createdAt: previous?.createdAt || clean.createdAt,
    updatedAt: now,
    completedAt: clean.completedAt || now,
  };

  const others = existing.decisions.filter((entry) => entry.id !== record.id);
  const written = writeAll([record, ...others]);
  if (!written.ok) return { ...written, ok: false };
  return { ok: true, decision: record, persistent: written.persistent };
}

export function getDecision(id) {
  const result = readDecisions();
  const decision = result.decisions.find((record) => record.id === id) || null;
  return { ok: result.ok && Boolean(decision), decision, error: result.error };
}

export function deleteDecision(id) {
  const existing = readDecisions();
  if (!existing.decisions.some((record) => record.id === id)) {
    return { ok: false, error: 'That decision could not be found.' };
  }
  const written = writeAll(existing.decisions.filter((record) => record.id !== id));
  if (!written.ok) return { ok: false, error: written.error };
  return { ok: true, persistent: written.persistent };
}

export function duplicateDecision(id, copyLabel = 'copy') {
  const existing = getDecision(id);
  if (!existing.decision) return { ok: false, error: 'That decision could not be found.' };

  const source = existing.decision;
  const now = new Date().toISOString();
  const label = typeof copyLabel === 'string' && copyLabel.trim() ? copyLabel.trim() : 'copy';
  const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const copyMarker = new RegExp(`\\s*\\((?:copy|${escaped(label)})(?: \\d+)?\\)$`, 'i');
  const baseTitle = source.title.replace(copyMarker, '').trim();
  let title = `${baseTitle} (${label})`.slice(0, 120);
  let attempt = 2;
  while (readDecisions().decisions.some((record) => record.title === title)) {
    title = `${baseTitle} (${label} ${attempt})`.slice(0, 120);
    attempt += 1;
  }

  const copy = {
    ...source,
    id: createId('dec'),
    title,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
    options: source.options.map((option) => ({ ...option })),
    criteria: source.criteria.map((criterion) => ({ ...criterion })),
    ratings: Object.fromEntries(Object.entries(source.ratings).map(([key, value]) => [key, { ...value }])),
  };
  return saveDecision(copy);
}

export function getRecentDecisions(limit = 3) {
  return readDecisions().decisions.slice(0, limit);
}

export function saveDraft(decision) {
  const clean = sanitizeDraft(decision);
  if (!clean) return { ok: false, error: 'The draft is empty.' };
  return writeRaw(KEYS.draft, JSON.stringify({ ...clean, savedAt: new Date().toISOString() }));
}

export function loadDraft() {
  const raw = readRaw(KEYS.draft);
  if (!raw) return { ok: true, decision: null };
  try {
    const parsed = JSON.parse(raw);
    const clean = sanitizeDraft(parsed);
    if (!clean) {
      removeRaw(KEYS.draft);
      return { ok: false, decision: null, error: 'The saved draft could not be read and was cleared.' };
    }
    return { ok: true, decision: clean };
  } catch {
    removeRaw(KEYS.draft);
    return { ok: false, decision: null, error: 'The saved draft was corrupted and was cleared.' };
  }
}

export function clearDraft() {
  return removeRaw(KEYS.draft);
}

export function loadTheme() {
  const value = readRaw(KEYS.theme);
  return value === 'light' || value === 'dark' ? value : null;
}

export function saveTheme(theme) {
  if (theme !== 'light' && theme !== 'dark') return { ok: false };
  return writeRaw(KEYS.theme, theme);
}

export function loadLanguage() {
  const value = readRaw(KEYS.language);
  return value === 'en' || value === 'ar' ? value : null;
}

export function saveLanguage(language) {
  if (language !== 'en' && language !== 'ar') return { ok: false };
  return writeRaw(KEYS.language, language);
}

export function getStorageStatus() {
  return { available: isAvailable(), persistent: isAvailable() };
}

export { KEYS, VERSION };
