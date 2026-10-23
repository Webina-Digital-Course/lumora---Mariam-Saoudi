/**
 * LUMORA — application controller
 * Vanilla ES modules. State, rendering, and interactions live here;
 * maths lives in scoring.js and persistence lives in storage.js.
 */
import {
  validateComparison,
  calculateScores,
  explainResults,
  compareOptions,
  TIE_PRECISION,
} from './scoring.js';
import * as storage from './storage.js';
import {
  t,
  tn,
  initLanguage,
  setLanguage,
  getLanguage,
  formatDate as formatDateI18n,
  formatList,
  LANGUAGE_EVENT,
  languages,
} from './i18n.js';
import { buildContactLinks, buildWhatsAppUrl } from './site-config.js';

/* ============================================================
   Constants and sample data
   ============================================================ */
const SAMPLE_OPTIONS = [
  {
    id: 'opt_campus',
    nameKey: 'sample.option.campus.name',
    descriptionKey: 'sample.option.campus.description',
  },
  {
    id: 'opt_online',
    nameKey: 'sample.option.online.name',
    descriptionKey: 'sample.option.online.description',
  },
  {
    id: 'opt_studio',
    nameKey: 'sample.option.studio.name',
    descriptionKey: 'sample.option.studio.description',
  },
];

const SAMPLE_CRITERIA = [
  { id: 'crit_cost', nameKey: 'default.cost', weight: 4 },
  { id: 'crit_quality', nameKey: 'default.quality', weight: 5 },
  { id: 'crit_time', nameKey: 'default.time', weight: 3 },
  { id: 'crit_future', nameKey: 'default.future', weight: 4 },
];

const SAMPLE_RATINGS = {
  opt_campus: { crit_cost: 3, crit_quality: 10, crit_time: 4, crit_future: 9 },
  opt_online: { crit_cost: 8, crit_quality: 7, crit_time: 9, crit_future: 5 },
  opt_studio: { crit_cost: 8, crit_quality: 6, crit_time: 7, crit_future: 8 },
};

const SAMPLE_PRESETS = {
  balanced: {
    labelKey: 'sample.preset.balanced',
    weights: { crit_cost: 4, crit_quality: 5, crit_time: 3, crit_future: 4 },
  },
  budget: {
    labelKey: 'sample.preset.budget',
    weights: { crit_cost: 5, crit_quality: 2, crit_time: 3, crit_future: 1 },
  },
  growth: {
    labelKey: 'sample.preset.growth',
    weights: { crit_cost: 2, crit_quality: 5, crit_time: 2, crit_future: 5 },
  },
};

const ROUTES = {
  home: '#/',
  setup: '#/build',
  rate: '#/rate',
  report: '#/report',
  saved: '#/saved',
};

const ICONS = {
  arrow:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  trash:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.2h5.8l.6-8.2M6.8 7v3.5M9.2 7v3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.2" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 5.5v-1a1.5 1.5 0 0 0-1.5-1.5H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 11h1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  print:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 6V2.8h6V6M5 11H3.5A1.5 1.5 0 0 1 2 9.5v-2A1.5 1.5 0 0 1 3.5 6h9A1.5 1.5 0 0 1 14 7.5v2a1.5 1.5 0 0 1-1.5 1.5H11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><rect x="5" y="9" width="6" height="4.2" rx="0.6" stroke="currentColor" stroke-width="1.2"/></svg>',
  refresh:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 6.5A5.2 5.2 0 1 0 13 10M13 3v3.5H9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m10.8 2.7 2.5 2.5L5.6 12.9l-3 .6.6-3 7.6-7.8ZM9.4 4.1l2.5 2.5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  save:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.8 3.8A1 1 0 0 1 3.8 2.8h6.7l2.7 2.7v6.7a1 1 0 0 1-1 1H3.8a1 1 0 0 1-1-1V3.8Z" stroke="currentColor" stroke-width="1.2"/><path d="M5.2 2.8v3h4.6v-3M5.2 13.2V9h5.6v4.2" stroke="currentColor" stroke-width="1.1"/></svg>',
  search:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4"/><path d="m10.4 10.4 3.1 3.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  check:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8.5 3.1 3.2L13 4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  back:
    '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3M7 4 3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const EMPTY_ART = `
<svg viewBox="0 0 420 300" fill="none" role="presentation" focusable="false">
  <path d="M34 50h352M34 252h352" stroke="currentColor" stroke-opacity=".2"/>
  <path d="M78 74v154M346 74v154" stroke="currentColor" stroke-opacity=".16" stroke-dasharray="2 8"/>
  <g fill="currentColor" fill-opacity=".52" font-family="ui-monospace,Consolas,monospace" font-size="7" letter-spacing="1.5">
    <text x="34" y="36">FIELD NOTE / EMPTY</text>
    <text x="386" y="36" text-anchor="end">ROOM TO BEGIN</text>
  </g>
  <g fill="currentColor" font-family="Georgia,'Times New Roman',serif" font-size="16">
    <text x="78" y="94" fill-opacity=".62">Option 01</text>
    <text x="78" y="144" fill-opacity=".46">Option 02</text>
    <text x="78" y="194" fill-opacity=".62">Option 03</text>
  </g>
  <g stroke="currentColor" stroke-width="1.2">
    <path d="M78 108h56c42 0 48 22 66 37" stroke-opacity=".34"/>
    <path d="M78 158h48c46 0 52 0 74-4" stroke-opacity=".24"/>
    <path d="M78 208h38c52 0 56-36 84-56" stroke-opacity=".34"/>
  </g>
  <g fill="currentColor">
    <circle cx="78" cy="108" r="3" fill-opacity=".46"/>
    <circle cx="78" cy="158" r="3" fill-opacity=".3"/>
    <circle cx="78" cy="208" r="3" fill-opacity=".46"/>
  </g>
  <path d="M212 148h114" stroke="var(--accent)" stroke-width="2"/>
  <circle cx="326" cy="148" r="7" fill="var(--accent)"/>
  <circle cx="326" cy="148" r="15" stroke="var(--accent)" stroke-opacity=".28"/>
  <g fill="var(--accent)" font-family="ui-monospace,Consolas,monospace" font-size="6.5" letter-spacing="1.2">
    <text x="326" y="184" text-anchor="middle">YOUR CLARITY</text>
    <text x="326" y="194" text-anchor="middle" fill-opacity=".62">GOES HERE</text>
  </g>
  <g stroke="currentColor" stroke-opacity=".22">
    <path d="M78 244v8M112 244v5M146 244v8M180 244v5M214 244v8"/>
  </g>
  <g fill="currentColor" fill-opacity=".38" font-family="ui-monospace,Consolas,monospace" font-size="6.5" letter-spacing="1.4">
    <text x="34" y="278">NOTHING SAVED YET</text>
    <text x="386" y="278" text-anchor="end">SPACE TO THINK</text>
  </g>
</svg>`;

/* ============================================================
   State
   ============================================================ */
const state = {
  decision: null,
  step: 'setup',
  view: 'home',
  dirty: false,
  savedCurrent: false,
  savedAt: null,
  examplePreset: 'balanced',
  savedQuery: '',
  draftNoticeShown: false,
  storageNoticeShown: false,
  toastTimer: null,
};

/* ============================================================
   Tiny DOM helpers
   ============================================================ */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.class) node.className = options.class;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.html !== undefined) node.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== false) node.setAttribute(key, value);
    });
  }
  if (options.props) Object.assign(node, options.props);
  if (options.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.dataset[key] = String(value);
    });
  }
  if (options.on) {
    Object.entries(options.on).forEach(([event, handler]) => node.addEventListener(event, handler));
  }
  const list = Array.isArray(children) ? children : [children];
  list.forEach((child) => {
    if (child === null || child === undefined) return;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return node;
}

function icon(name) {
  const directional = name === 'arrow' || name === 'back';
  const span = el('span', {
    class: `icon${directional ? ' icon-arrow' : ''}`,
    attrs: { 'aria-hidden': 'true' },
  });
  span.innerHTML = ICONS[name] || '';
  return span;
}

function svgIconButton(name, label, className = 'icon-only') {
  return el('button', {
    class: className,
    attrs: { type: 'button', 'aria-label': label, title: label },
    html: ICONS[name] || '',
  });
}

const reduceMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const fmt = (value) => Number(value).toFixed(1);
const fmtDelta = (value) => `${value >= 0 ? '+' : '−'}${Math.abs(value).toFixed(1)}`;
const pad = (value) => String(value).padStart(2, '0');

function formatDate(iso) {
  return formatDateI18n(iso, getLanguage());
}

function plural(key, count, vars = {}) {
  return tn(key, count, vars);
}

function localizeStorageError(message) {
  if (!message) return '';
  if (getLanguage() === 'en') return message;
  const text = String(message);
  const skipped = text.match(/^(\d+) saved decisions? could not be read/);
  if (skipped) return t('storage.skipped', { count: skipped[1] });
  const known = {
    'Browser storage is full. Free some space, then save again.': 'storage.quota',
    'The browser refused to save this data.': 'storage.refusedSave',
    'The browser refused to remove this data.': 'storage.refusedRemove',
    'Saved decisions were unreadable. A backup was kept and the library was reset.':
      'storage.unreadableBackedUp',
    'Saved decisions were unreadable and could not be backed up. Existing data was left untouched.':
      'storage.unreadableNoBackup',
    'The saved-decision library had an unexpected format.': 'storage.unexpected',
    'This decision is incomplete or contains invalid data, so it was not saved.': 'storage.incomplete',
    'That decision could not be found.': 'toast.notFound',
    'The draft is empty.': 'storage.draftEmpty',
    'The saved draft could not be read and was cleared.': 'storage.draftUnreadable',
    'The saved draft was corrupted and was cleared.': 'storage.draftCorrupt',
  };
  return known[text] ? t(known[text]) : text;
}

function hasDecisionContent(decision) {
  if (!decision) return false;
  return Boolean(
    (decision.title && decision.title.trim()) ||
      decision.options?.some((option) => option.name?.trim()) ||
      decision.ratings?.[decision.options?.[0]?.id]?.[decision.criteria?.[0]?.id] !== undefined
  );
}

function ratingValue(decision, optionId, criterionId) {
  const value = decision?.ratings?.[optionId]?.[criterionId];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function setDecisionTitle(value) {
  if (!state.decision) return;
  state.decision.title = value;
  const titleNode = $('#studioTitle');
  if (titleNode) titleNode.textContent = value.trim() || t('studio.untitled');
  const eyebrow = $('#studioEyebrow');
  if (eyebrow) eyebrow.textContent = state.dirty ? t('studio.draft') : t('studio.new');
}

/* ============================================================
   Theme
   ============================================================ */
function applyTheme(theme, { persist = false } = {}) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.documentElement.style.colorScheme = next;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'light' ? '#F1EBDD' : '#101712');
  const toggle = $('#themeToggle');
  if (toggle) {
    const label = t(next === 'light' ? 'nav.switchDark' : 'nav.switchLight');
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }
  if (persist) {
    const result = storage.saveTheme(next);
    if (result && result.ok === false) {
      showToast(t('toast.themeRemember'), { tone: 'error' });
    }
  }
}

function initTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current);
  const toggle = $('#themeToggle');
  toggle?.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(now, { persist: true });
  });
}

/* ============================================================
   Toast + dialog
   ============================================================ */
function showToast(message, { tone = 'default', duration = 4600 } = {}) {
  const toast = $('#toast');
  if (!toast) return;
  window.clearTimeout(state.toastTimer);
  toast.hidden = false;
  toast.className = 'toast';
  if (tone === 'error') toast.classList.add('is-error');
  if (tone === 'note') toast.classList.add('is-note');
  toast.textContent = '';
  window.setTimeout(() => {
    toast.textContent = message;
  }, 10);
  state.toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, duration);
}

function askConfirm({
  title = t('dialog.title'),
  body,
  eyebrow = t('dialog.eyebrow'),
  confirmLabel = t('dialog.confirm'),
  danger = true,
} = {}) {
  const dialog = $('#confirmDialog');
  const titleNode = $('#confirmTitle');
  const bodyNode = $('#confirmBody');
  const eyebrowNode = $('#confirmEyebrow');
  const ok = $('#confirmOk');
  const cancel = $('#confirmCancel');

  if (!dialog || !titleNode || !bodyNode || !ok || !cancel) return Promise.resolve(false);
  if (dialog.open) dialog.close();

  titleNode.textContent = title;
  bodyNode.textContent = body;
  eyebrowNode.textContent = eyebrow;
  ok.textContent = confirmLabel;
  ok.className = danger ? 'btn btn-danger' : 'btn btn-primary';

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onBackdrop);
      resolve(value);
    };
    const onClose = () => finish(false);
    const onBackdrop = (event) => {
      if (event.target === dialog) dialog.close();
    };
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', onBackdrop);
    ok.onclick = () => {
      if (settled) return;
      settled = true;
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('click', onBackdrop);
      dialog.close();
      resolve(true);
    };
    cancel.onclick = () => dialog.close();
    dialog.showModal();
    cancel.focus();
  });
}

/* ============================================================
   Mobile navigation
   ============================================================ */
function setMenu(open) {
  const menu = $('#mobileMenu');
  const button = $('#mobileMenuBtn');
  if (!menu || !button) return;
  menu.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', t(open ? 'nav.closeMenu' : 'nav.openMenu'));
  document.body.classList.toggle('menu-open', open);
}

/* ============================================================
   Language
   ============================================================ */
function updateFooterRights() {
  const node = $('#footerRights');
  if (node) node.textContent = t('footer.rights', { year: new Date().getFullYear() });
}

function refreshForLanguage() {
  const setupError = $('#setupErrorSummary');
  const ratingError = $('#ratingErrorSummary');
  const showSetupError = setupError ? !setupError.hidden : false;
  const showRatingError = ratingError ? !ratingError.hidden : false;
  updateFooterRights();
  applyTheme(document.documentElement.getAttribute('data-theme'));
  setMenu(false);
  renderContact();

  if (state.view === 'home') {
    renderLanding();
  } else if (state.view === 'studio') {
    renderStudio();
    if (showSetupError && state.step === 'setup') validateSetup({ focus: false, announce: false });
    if (showRatingError && state.step === 'rate') validateRatings({ focus: false, announce: false });
  } else if (state.view === 'saved') {
    renderSaved();
  }
}

function initLanguageControls() {
  document.querySelectorAll('[data-lang-button]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.langButton));
  });
  window.addEventListener(LANGUAGE_EVENT, refreshForLanguage);
}

function initNavigation() {
  const button = $('#mobileMenuBtn');
  const menu = $('#mobileMenu');
  button?.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('menu-open')) return;
    if (event.target.closest('#mobileMenu') || event.target.closest('#mobileMenuBtn')) return;
    setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      button?.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenu(false);
  });

  const header = $('#siteHeader');
  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ============================================================
   Reveal-on-scroll
   ============================================================ */
let revealObserver = null;

function initReveals() {
  if (!('IntersectionObserver' in window) || reduceMotion()) {
    $$('.reveal').forEach((node) => node.classList.add('is-visible'));
    return;
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  observeReveals();
}

function observeReveals() {
  if (!revealObserver) {
    $$('.reveal').forEach((node) => node.classList.add('is-visible'));
    return;
  }
  $$('.reveal:not(.is-visible)').forEach((node) => revealObserver.observe(node));
}

/* ============================================================
   Hero pointer interaction
   ============================================================ */
function initHeroInteraction() {
  const visual = $('#heroVisual');
  if (!visual) return;
  const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (!finePointer || reduceMotion()) return;

  visual.classList.add('is-live');
  let frame = null;
  let lastX = 0;
  let lastY = 0;

  const render = () => {
    visual.style.setProperty('--px', lastX.toFixed(3));
    visual.style.setProperty('--py', lastY.toFixed(3));
    frame = null;
  };

  visual.addEventListener('pointermove', (event) => {
    const rect = visual.getBoundingClientRect();
    lastX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
    lastY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
    if (!frame) frame = window.requestAnimationFrame(render);
  });
  visual.addEventListener('pointerleave', () => {
    lastX = 0;
    lastY = 0;
    visual.style.setProperty('--px', '0');
    visual.style.setProperty('--py', '0');
  });
}

/* ============================================================
   Rotating hero headline
   ============================================================ */
const HERO_PHRASE_COUNT = 5;
const HERO_INTERVAL = 5000;
const HERO_FADE = 320;
let heroRotationTimer = null;
let heroFadeTimer = null;
let heroRotationIndex = 0;
const heroMotionQuery =
  window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

function stopHeroRotation() {
  window.clearTimeout(heroRotationTimer);
  window.clearTimeout(heroFadeTimer);
  heroRotationTimer = null;
  heroFadeTimer = null;
  $('#heroRotator')?.classList.remove('is-changing');
}

function renderHeroPhrases(index = heroRotationIndex) {
  const rotator = $('#heroRotator');
  if (!rotator) return;
  const safeIndex = Math.max(0, Math.min(HERO_PHRASE_COUNT - 1, index));
  const fragment = document.createDocumentFragment();
  for (let phraseIndex = 0; phraseIndex < HERO_PHRASE_COUNT; phraseIndex += 1) {
    fragment.append(
      el('span', {
        class: `hero-phrase${phraseIndex === safeIndex ? ' is-active' : ''}`,
        attrs: {
          'data-hero-index': phraseIndex,
          'aria-hidden': String(phraseIndex !== safeIndex),
        },
        text: t(`hero.rotating.${phraseIndex}`),
      })
    );
  }
  rotator.replaceChildren(fragment);
  heroRotationIndex = safeIndex;
}

function scheduleHeroRotation() {
  window.clearTimeout(heroRotationTimer);
  heroRotationTimer = null;
  if (heroMotionQuery?.matches || state.view !== 'home') return;
  heroRotationTimer = window.setTimeout(advanceHeroPhrase, HERO_INTERVAL);
}

function advanceHeroPhrase() {
  const rotator = $('#heroRotator');
  if (!rotator || document.hidden || heroMotionQuery?.matches) return;
  rotator.classList.add('is-changing');
  window.clearTimeout(heroFadeTimer);
  heroFadeTimer = window.setTimeout(() => {
    heroRotationIndex = (heroRotationIndex + 1) % HERO_PHRASE_COUNT;
    Array.from(rotator.children).forEach((phrase, index) => {
      phrase.classList.toggle('is-active', index === heroRotationIndex);
      phrase.setAttribute('aria-hidden', String(index !== heroRotationIndex));
    });
    rotator.classList.remove('is-changing');
    scheduleHeroRotation();
  }, HERO_FADE);
}

function startHeroRotation({ preserveIndex = true, restart = true } = {}) {
  if (restart) stopHeroRotation();
  const index = preserveIndex ? heroRotationIndex : 0;
  renderHeroPhrases(index);
  if (heroMotionQuery?.matches) return;
  scheduleHeroRotation();
}

function initHeroRotation() {
  const onMotionChange = () => startHeroRotation({ preserveIndex: true, restart: true });
  heroMotionQuery?.addEventListener?.('change', onMotionChange);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopHeroRotation();
    else if (state.view === 'home') startHeroRotation({ preserveIndex: true, restart: true });
  });
  window.addEventListener('pagehide', stopHeroRotation);
  startHeroRotation({ preserveIndex: false, restart: true });
}

/* ============================================================
   Contact
   ============================================================ */
const CONTACT_SUGGESTIONS = [
  {
    id: 'hello',
    titleKey: 'contact.suggestion.hello.title',
    descriptionKey: 'contact.suggestion.hello.description',
    messageKey: 'contact.suggestion.hello.message',
  },
  {
    id: 'question',
    titleKey: 'contact.suggestion.question.title',
    descriptionKey: 'contact.suggestion.question.description',
    messageKey: 'contact.suggestion.question.message',
  },
  {
    id: 'idea',
    titleKey: 'contact.suggestion.idea.title',
    descriptionKey: 'contact.suggestion.idea.description',
    messageKey: 'contact.suggestion.idea.message',
  },
  {
    id: 'feedback',
    titleKey: 'contact.suggestion.feedback.title',
    descriptionKey: 'contact.suggestion.feedback.description',
    messageKey: 'contact.suggestion.feedback.message',
  },
];

function contactMethodHeading(id, title, hint) {
  return el('div', { class: 'contact-method-head' }, [
    el('h3', { class: 'mono-label', attrs: { id }, text: title }),
    el('span', { class: 'contact-method-hint', text: hint }),
  ]);
}

function renderContactSuggestions(suggestions) {
  return el(
    'div',
    { class: 'contact-suggestions' },
    suggestions.map((suggestion, index) =>
      el(
        'a',
        {
          class: 'contact-suggestion',
          attrs: {
            href: suggestion.href,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        },
        [
          el('span', { class: 'contact-index', text: pad(index + 1) }),
          el('span', { class: 'contact-suggestion-copy' }, [
            el('strong', { text: t(suggestion.titleKey) }),
            el('span', { text: t(suggestion.descriptionKey) }),
          ]),
          el('span', { class: 'contact-suggestion-go' }, [
            el('span', { class: 'contact-go', attrs: { 'aria-hidden': 'true' }, text: '↗' }),
          ]),
        ]
      )
    )
  );
}

function renderContactDirect(links, startIndex) {
  return el(
    'div',
    { class: 'contact-direct' },
    links.map((link, index) =>
      el(
        'a',
        {
          class: `contact-card${link.id === 'email' ? ' contact-card-email' : ''}`,
          attrs: {
            href: link.href,
            ...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
        },
        [
          el('span', { class: 'contact-index', text: pad(startIndex + index) }),
          el('span', { class: 'contact-body' }, [
            el('strong', { text: t(link.labelKey) }),
            el('span', { class: 'contact-value', text: link.value }),
          ]),
          el('span', { class: 'contact-action' }, [
            t(link.actionKey),
            el('span', { class: 'contact-go', attrs: { 'aria-hidden': 'true' }, text: '↗' }),
          ]),
        ]
      )
    )
  );
}

function renderContact() {
  const container = $('#contactLinks');
  if (!container) return;

  const directLinks = buildContactLinks();
  const suggestions = CONTACT_SUGGESTIONS.map((suggestion) => ({
    ...suggestion,
    href: buildWhatsAppUrl(t(suggestion.messageKey)),
  })).filter((suggestion) => suggestion.href);
  const note = document.querySelector('.contact-note');
  if (note) note.hidden = suggestions.length === 0;
  container.replaceChildren();

  if (suggestions.length) {
    container.append(
      el(
        'section',
        { class: 'contact-method', attrs: { 'aria-labelledby': 'contactWhatsAppHeading' } },
        [
          contactMethodHeading(
            'contactWhatsAppHeading',
            t('contact.whatsapp'),
            t('contact.whatsappHint')
          ),
          renderContactSuggestions(suggestions),
        ]
      )
    );
  }

  if (directLinks.length) {
    container.append(
      el(
        'section',
        {
          class: 'contact-method contact-method-direct',
          attrs: { 'aria-labelledby': 'contactDirectHeading' },
        },
        [
          contactMethodHeading(
            'contactDirectHeading',
            t('contact.directHeading'),
            t('contact.directHint')
          ),
          renderContactDirect(directLinks, suggestions.length + 1),
        ]
      )
    );
  }
}

/* ============================================================
   Decision factories
   ============================================================ */
function makeBlankDecision() {
  const now = new Date().toISOString();
  const criteria = [
    { id: storage.createId('crit'), name: t('default.cost'), weight: 4 },
    { id: storage.createId('crit'), name: t('default.quality'), weight: 5 },
    { id: storage.createId('crit'), name: t('default.time'), weight: 3 },
    { id: storage.createId('crit'), name: t('default.future'), weight: 4 },
  ];
  return {
    version: 1,
    id: storage.createId('dec'),
    title: '',
    description: '',
    options: [
      { id: storage.createId('opt'), name: '', description: '' },
      { id: storage.createId('opt'), name: '', description: '' },
    ],
    criteria,
    ratings: {},
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

function normalizeForEditing(source) {
  const decision = {
    version: 1,
    id: source?.id || storage.createId('dec'),
    title: typeof source?.title === 'string' ? source.title : '',
    description: typeof source?.description === 'string' ? source.description : '',
    options: Array.isArray(source?.options) ? source.options.map((option) => ({ ...option })) : [],
    criteria: Array.isArray(source?.criteria) ? source.criteria.map((criterion) => ({ ...criterion })) : [],
    ratings: {},
    createdAt: source?.createdAt || new Date().toISOString(),
    updatedAt: source?.updatedAt || new Date().toISOString(),
    completedAt: source?.completedAt || null,
  };

  while (decision.options.length < 2) {
    decision.options.push({ id: storage.createId('opt'), name: '', description: '' });
  }
  decision.options = decision.options.slice(0, 4);
  if (decision.criteria.length === 0) {
    decision.criteria.push({ id: storage.createId('crit'), name: t('default.quality'), weight: 3 });
  }
  decision.criteria = decision.criteria.slice(0, 12);

  decision.options.forEach((option) => {
    decision.ratings[option.id] = {};
    decision.criteria.forEach((criterion) => {
      const value = source?.ratings?.[option.id]?.[criterion.id];
      if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10) {
        decision.ratings[option.id][criterion.id] = value;
      }
    });
  });
  return decision;
}

function createSampleDecision(presetKey = 'balanced') {
  const preset = SAMPLE_PRESETS[presetKey] || SAMPLE_PRESETS.balanced;
  const criteria = SAMPLE_CRITERIA.map((criterion) => ({
    id: criterion.id,
    name: t(criterion.nameKey),
    weight: preset.weights[criterion.id] ?? criterion.weight,
  }));
  const now = new Date().toISOString();
  return {
    version: 1,
    id: storage.createId('dec'),
    title: t('sample.decision.title'),
    description: t('sample.decision.description'),
    options: SAMPLE_OPTIONS.map((option) => ({
      id: option.id,
      name: t(option.nameKey),
      description: t(option.descriptionKey),
    })),
    criteria,
    ratings: Object.fromEntries(
      Object.entries(SAMPLE_RATINGS).map(([optionId, ratings]) => [optionId, { ...ratings }])
    ),
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };
}

/* ============================================================
   Drafts and dirty state
   ============================================================ */
let draftTimer = null;

function scheduleDraftSave() {
  window.clearTimeout(draftTimer);
  draftTimer = window.setTimeout(() => {
    if (state.decision && state.dirty) storage.saveDraft(state.decision);
  }, 400);
}

function markDirty() {
  if (!state.decision) return;
  state.dirty = true;
  state.decision.updatedAt = new Date().toISOString();
  updateSaveState();
  const eyebrow = $('#studioEyebrow');
  if (eyebrow) eyebrow.textContent = t('studio.draft');
  scheduleDraftSave();
}

function updateSaveState() {
  const node = $('#saveState');
  const label = $('#saveDecisionBtn');
  if (!node) return;
  node.classList.remove('is-saved', 'is-dirty');
  const text = $('span:last-child', node);
  if (state.dirty) {
    node.classList.add('is-dirty');
    if (text) text.textContent = t('save.unsaved');
  } else if (state.savedCurrent) {
    node.classList.add('is-saved');
    if (text) text.textContent = t('save.saved');
  } else {
    if (text) text.textContent = t('save.notSaved');
  }
  if (label) label.textContent = t(state.savedCurrent ? 'save.update' : 'save.save');
}

function ensureDecision() {
  if (state.decision) return;
  const draft = storage.loadDraft();
  if (draft.ok && draft.decision && hasDecisionContent(draft.decision)) {
    state.decision = normalizeForEditing(draft.decision);
    state.dirty = true;
    if (!state.draftNoticeShown) {
      showToast(t('toast.draftRestored'), { tone: 'note' });
      state.draftNoticeShown = true;
    }
  } else {
    state.decision = makeBlankDecision();
  }
}

async function resetToBlank({ skipConfirm = false } = {}) {
  if (!skipConfirm && state.dirty && hasDecisionContent(state.decision)) {
    const confirmed = await askConfirm({
      title: t('confirm.startBlank.title'),
      body: t('confirm.startBlank.body'),
      confirmLabel: t('confirm.startBlank.confirm'),
    });
    if (!confirmed) return false;
  }
  state.decision = makeBlankDecision();
  state.dirty = false;
  state.savedCurrent = false;
  state.savedAt = null;
  state.step = 'setup';
  state.draftNoticeShown = true;
  storage.clearDraft();
  return true;
}

/* ============================================================
   Routing and views
   ============================================================ */
function showView(name) {
  state.view = name;
  if (name !== 'home') stopHeroRotation();
  $('#landingView').hidden = name !== 'home';
  $('#studioView').hidden = name !== 'studio';
  $('#savedView').hidden = name !== 'saved';
  document.body.dataset.view = name;
  updateNavState();
}

function updateNavState() {
  const workspaceLinks = $$('[data-workspace]');
  const savedLinks = $$('[data-saved-link]');
  const inStudio = state.view === 'studio';
  const inSaved = state.view === 'saved';
  workspaceLinks.forEach((link) => {
    if (inStudio) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  savedLinks.forEach((link) => {
    if (inSaved) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function routeForStep(step) {
  if (step === 'rate') return ROUTES.rate;
  if (step === 'report') return ROUTES.report;
  return ROUTES.setup;
}

function navigate(hash, { replace = false } = {}) {
  if (location.hash === hash) {
    handleRoute();
    return;
  }
  if (replace) {
    history.replaceState(null, '', hash);
    handleRoute();
  } else {
    location.hash = hash;
  }
}

function handleRoute() {
  setMenu(false);
  const hash = location.hash || ROUTES.home;

  if (hash.startsWith('#/saved')) {
    showView('saved');
    renderSaved();
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  if (hash === ROUTES.setup || hash === ROUTES.rate || hash === ROUTES.report) {
    showView('studio');
    ensureDecision();

    if (hash === ROUTES.report) {
      const complete = validateRatings({ focus: false, announce: false, silent: true });
      if (!complete) {
        const setupReady = validateSetup({ focus: false, announce: false, clear: false, silent: true });
        state.step = setupReady ? 'rate' : 'setup';
        history.replaceState(null, '', routeForStep(state.step));
        showToast(t('rate.toast.finishBeforeReport'), { tone: 'note' });
      } else {
        state.step = 'report';
      }
    } else if (hash === ROUTES.rate) {
      const setupReady = validateSetup({ focus: false, announce: false, clear: false, silent: true });
      if (!setupReady) {
        state.step = 'setup';
        history.replaceState(null, '', ROUTES.setup);
        showToast(t('rate.toast.completeSetup'), { tone: 'note' });
      } else {
        state.step = 'rate';
      }
    } else {
      state.step = 'setup';
    }

    renderStudio();
    window.scrollTo({ top: 0, behavior: 'auto' });
    return;
  }

  showView('home');
  renderLanding();
  if (hash !== ROUTES.home) history.replaceState(null, '', ROUTES.home);
}

function scrollToSection(id) {
  if (state.view !== 'home') {
    navigate(ROUTES.home);
    window.setTimeout(() => {
      const target = document.getElementById(id);
      target?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    }, 60);
    return;
  }
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
}

/* ============================================================
   Start / open / flow actions
   ============================================================ */
function startDecisionFlow() {
  ensureDecision();
  if (state.dirty && hasDecisionContent(state.decision)) {
    state.step = state.step === 'report' ? 'setup' : state.step;
    navigate(routeForStep(state.step));
    showToast(t('toast.continueUnsaved'), { tone: 'note' });
    return;
  }
  if (!state.savedCurrent && hasDecisionContent(state.decision)) {
    navigate(routeForStep(state.step));
    return;
  }
  state.decision = makeBlankDecision();
  state.dirty = false;
  state.savedCurrent = false;
  state.savedAt = null;
  state.step = 'setup';
  storage.clearDraft();
  navigate(ROUTES.setup);
}

async function loadSampleFlow() {
  if (state.dirty && hasDecisionContent(state.decision)) {
    const confirmed = await askConfirm({
      title: t('confirm.loadSample.title'),
      body: t('confirm.loadSample.body'),
      confirmLabel: t('confirm.loadSample.confirm'),
      danger: false,
    });
    if (!confirmed) return;
  }
  state.decision = createSampleDecision(state.examplePreset);
  state.decision.completedAt = new Date().toISOString();
  state.dirty = true;
  state.savedCurrent = false;
  state.savedAt = null;
  state.step = 'report';
  state.draftNoticeShown = true;
  storage.saveDraft(state.decision);
  navigate(ROUTES.report);
  showToast(t('toast.sampleLoaded'), { tone: 'note' });
}

async function openSavedDecision(id) {
  const record = storage.getDecision(id);
  if (!record.ok || !record.decision) {
    showToast(localizeStorageError(record.error) || t('toast.decisionOpen'), { tone: 'error' });
    renderSaved();
    return;
  }
  if (state.dirty && hasDecisionContent(state.decision) && state.decision.id !== id) {
    const confirmed = await askConfirm({
      title: t('confirm.open.title'),
      body: t('confirm.open.body'),
      confirmLabel: t('confirm.open.confirm'),
      danger: false,
    });
    if (!confirmed) return;
  }
  state.decision = normalizeForEditing(record.decision);
  state.dirty = false;
  state.savedCurrent = true;
  state.savedAt = record.decision.updatedAt;
  state.step = 'report';
  storage.clearDraft();
  navigate(ROUTES.report);
}

/* ============================================================
   Setup validation
   ============================================================ */
function collectSetupIssues(decision = state.decision) {
  const issues = [];
  if (!decision) return [{ message: t('setup.issue.load'), targetId: null }];

  if (!decision.title || !decision.title.trim()) {
    issues.push({ message: t('setup.issue.title'), targetId: 'decisionTitle', errorId: 'decisionTitleError' });
  }
  if (typeof decision.description === 'string' && decision.description.length > 300) {
    issues.push({
      message: t('setup.issue.descLength'),
      targetId: 'decisionDescription',
      errorId: 'decisionDescriptionError',
    });
  }
  if (decision.options.length < 2 || decision.options.length > 4) {
    issues.push({ message: t('setup.issue.optionCount'), targetId: null });
  }

  const optionNames = new Set();
  decision.options.forEach((option, index) => {
    const name = (option.name || '').trim();
    if (!name) {
      issues.push({
        message: t('setup.issue.optionName', { number: index + 1 }),
        targetId: `opt-name-${option.id}`,
        errorId: `opt-name-error-${option.id}`,
      });
    } else if (name.length > 60) {
      issues.push({
        message: t('setup.issue.optionNameLength', { number: index + 1 }),
        targetId: `opt-name-${option.id}`,
        errorId: `opt-name-error-${option.id}`,
      });
    } else if (optionNames.has(name.toLowerCase())) {
      issues.push({
        message: t('setup.issue.optionDistinct'),
        targetId: `opt-name-${option.id}`,
        errorId: `opt-name-error-${option.id}`,
      });
    }
    optionNames.add(name.toLowerCase());
  });

  if (decision.criteria.length < 1) {
    issues.push({ message: t('setup.issue.criteriaEmpty'), targetId: null });
  }
  if (decision.criteria.length > 12) {
    issues.push({ message: t('setup.issue.criteriaMax'), targetId: null });
  }

  const criterionNames = new Set();
  decision.criteria.forEach((criterion, index) => {
    const name = (criterion.name || '').trim();
    if (!name) {
      issues.push({
        message: t('setup.issue.criterionName', { number: index + 1 }),
        targetId: `crit-name-${criterion.id}`,
        errorId: `crit-name-error-${criterion.id}`,
      });
    } else if (name.length > 60) {
      issues.push({
        message: t('setup.issue.criterionNameLength', { number: index + 1 }),
        targetId: `crit-name-${criterion.id}`,
        errorId: `crit-name-error-${criterion.id}`,
      });
    } else if (criterionNames.has(name.toLowerCase())) {
      issues.push({
        message: t('setup.issue.criterionDistinct'),
        targetId: `crit-name-${criterion.id}`,
        errorId: `crit-name-error-${criterion.id}`,
      });
    }
    criterionNames.add(name.toLowerCase());
    if (!Number.isInteger(criterion.weight) || criterion.weight < 1 || criterion.weight > 5) {
      issues.push({
        message: t('setup.issue.weight', { name: name || t('common.thisCriterion') }),
        targetId: `crit-weight-${criterion.id}`,
        errorId: `crit-weight-error-${criterion.id}`,
      });
    }
  });

  return issues;
}

function hasValidSetup(decision = state.decision) {
  return collectSetupIssues(decision).length === 0;
}

function clearSetupErrors() {
  const form = $('#setupForm');
  if (!form) return;
  $$('.field-error', form).forEach((node) => {
    node.textContent = '';
  });
  $$('[aria-invalid="true"]', form).forEach((node) => node.removeAttribute('aria-invalid'));
  const summary = $('#setupErrorSummary');
  if (summary) {
    summary.hidden = true;
    summary.replaceChildren();
  }
}

function renderSetup() {
  const decision = state.decision;
  if (!decision) return;

  const title = $('#decisionTitle');
  const description = $('#decisionDescription');
  const count = $('#descCount');
  if (title) title.value = decision.title || '';
  if (description) description.value = decision.description || '';
  if (count) count.textContent = String((decision.description || '').length);

  renderOptionEditors();
  renderCriterionEditors();
  updateSetupCounts();
  clearSetupErrors();
}

function validateSetup({ focus = true, announce = true, clear = true } = {}) {
  const issues = collectSetupIssues();
  if (clear) clearSetupErrors();

  const summary = $('#setupErrorSummary');
  let firstTarget = null;

  issues.forEach((issue) => {
    if (issue.errorId) {
      const errorNode = document.getElementById(issue.errorId);
      if (errorNode) errorNode.textContent = issue.message;
    }
    if (issue.targetId) {
      const input = document.getElementById(issue.targetId);
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        if (!firstTarget) firstTarget = input;
      }
    }
  });

  if (issues.length && summary && announce) {
    summary.hidden = false;
    summary.replaceChildren();
    const strong = el('strong', {
      text: plural('setup.summary.details', issues.length),
    });
    const list = el('ul', {}, issues.slice(0, 5).map((issue) => el('li', { text: issue.message })));
    if (issues.length > 5) {
      list.append(el('li', { text: t('setup.summary.more', { count: issues.length - 5 }) }));
    }
    summary.append(strong, list);
  } else if (summary && clear) {
    summary.hidden = true;
    summary.replaceChildren();
  }

  if (firstTarget && focus) {
    firstTarget.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
    firstTarget.focus({ preventScroll: true });
  }

  return issues.length === 0;
}

/* ============================================================
   Setup rendering
   ============================================================ */
function renderOptionEditors() {
  const list = $('#optionsList');
  if (!list || !state.decision) return;
  const { options } = state.decision;
  const fragment = document.createDocumentFragment();

  options.forEach((option, index) => {
    const nameId = `opt-name-${option.id}`;
    const descId = `opt-desc-${option.id}`;
    const nameErrorId = `opt-name-error-${option.id}`;

    const remove = el('button', {
      class: 'icon-button',
      attrs: {
        type: 'button',
        'aria-label': t('setup.removeOptionAria', {
          number: index + 1,
          name: option.name ? `: ${option.name}` : '',
        }),
        title: t(options.length <= 2 ? 'setup.keepTwo' : 'setup.removeOption'),
        'data-remove-option': option.id,
      },
      html: ICONS.trash,
    });
    remove.disabled = options.length <= 2;

    const nameField = el('div', { class: 'field' }, [
      el('label', { attrs: { for: nameId }, text: t('setup.optionName') }),
      el('input', {
        class: 'option-name-input',
        attrs: {
          id: nameId,
          type: 'text',
          maxlength: '60',
          autocomplete: 'off',
          placeholder: t(index === 0 ? 'setup.optionNamePh1' : 'setup.optionNamePh2'),
          'data-field': 'name',
          'aria-describedby': nameErrorId,
        },
        props: { value: option.name || '' },
      }),
      el('small', { class: 'field-error', attrs: { id: nameErrorId } }),
    ]);

    const descField = el('div', { class: 'field' }, [
      el('label', { attrs: { for: descId } }, [
        `${t('setup.optionDesc')} `,
        el('span', { class: 'optional-mark', text: t('setup.optional') }),
      ]),
      el('input', {
        class: 'option-desc-input',
        attrs: {
          id: descId,
          type: 'text',
          maxlength: '180',
          autocomplete: 'off',
          placeholder: t('setup.optionDescPh'),
          'data-field': 'description',
        },
        props: { value: option.description || '' },
      }),
    ]);

    fragment.append(
      el('div', { class: 'option-editor', dataset: { optionId: option.id } }, [
        el('div', { class: 'option-editor-head' }, [
          el('span', {
            class: 'option-index',
            text: `${t('setup.optionIndex', { number: pad(index + 1) })}`,
          }),
          remove,
        ]),
        nameField,
        descField,
      ])
    );
  });

  list.replaceChildren(fragment);
}

function renderCriterionEditors() {
  const list = $('#criteriaList');
  if (!list || !state.decision) return;
  const { criteria } = state.decision;
  const fragment = document.createDocumentFragment();

  criteria.forEach((criterion, index) => {
    const nameId = `crit-name-${criterion.id}`;
    const weightId = `crit-weight-${criterion.id}`;
    const nameErrorId = `crit-name-error-${criterion.id}`;
    const weightErrorId = `crit-weight-error-${criterion.id}`;
    const pct = `${(criterion.weight / 5) * 100}%`;

    const remove = el('button', {
      class: 'icon-button',
      attrs: {
        type: 'button',
        'aria-label': t('setup.removeCriterionAria', {
          number: index + 1,
          name: criterion.name ? `: ${criterion.name}` : '',
        }),
        title: t(criteria.length <= 1 ? 'setup.keepOne' : 'setup.removeCriterion'),
        'data-remove-criterion': criterion.id,
      },
      html: ICONS.trash,
    });
    remove.disabled = criteria.length <= 1;

    const weightOutput = el('output', {
      attrs: { for: weightId },
      text: t('setup.weightValue', { weight: criterion.weight }),
    });

    fragment.append(
      el('div', { class: 'criterion-editor', dataset: { criterionId: criterion.id } }, [
        el('div', { class: 'criterion-fields' }, [
          el('label', { class: 'field-label', attrs: { for: nameId }, text: t('setup.criterionName') }),
          el('input', {
            class: 'criterion-name-input',
            attrs: {
              id: nameId,
              type: 'text',
              maxlength: '60',
              autocomplete: 'off',
              placeholder: t('setup.criterionPh'),
              'data-field': 'name',
              'aria-describedby': nameErrorId,
            },
            props: { value: criterion.name || '' },
          }),
          el('small', { class: 'field-error', attrs: { id: nameErrorId } }),
        ]),
        el('div', { class: 'weight-control' }, [
          el('label', {
            class: 'weight-control-label',
            attrs: { for: weightId },
          }, [t('setup.importance'), weightOutput]),
          el('input', {
            class: 'weight-range',
            attrs: {
              id: weightId,
              type: 'range',
              min: '1',
              max: '5',
              step: '1',
              'aria-describedby': weightErrorId,
              style: `--weight-pct: ${pct}`,
            },
            props: { value: String(criterion.weight) },
          }),
        ]),
        remove,
        el('small', { class: 'field-error', attrs: { id: weightErrorId } }),
      ])
    );
  });

  list.replaceChildren(fragment);
}

function updateSetupCounts() {
  if (!state.decision) return;
  const { options, criteria } = state.decision;
  const optionsCount = $('#optionsCount');
  const criteriaCount = $('#criteriaCount');
  const addOption = $('#addOption');
  const addCriterion = $('#addCriterion');
  if (optionsCount) optionsCount.textContent = `${options.length} / 4`;
  if (criteriaCount) criteriaCount.textContent = String(criteria.length);
  if (addOption) addOption.disabled = options.length >= 4;
  if (addCriterion) addCriterion.disabled = criteria.length >= 12;
}

function clearFieldErrorFor(element) {
  element.removeAttribute('aria-invalid');
  const field = element.closest('.field, .criterion-fields');
  const error = field?.querySelector('.field-error');
  if (error) error.textContent = '';
}

function optionHasRatings(optionId) {
  return Object.values(state.decision?.ratings?.[optionId] || {}).some(
    (value) => typeof value === 'number' && Number.isFinite(value)
  );
}

function criterionHasRatings(criterionId) {
  if (!state.decision) return false;
  return state.decision.options.some((option) => {
    const value = state.decision.ratings?.[option.id]?.[criterionId];
    return typeof value === 'number' && Number.isFinite(value);
  });
}

async function addOption() {
  if (!state.decision || state.decision.options.length >= 4) return;
  state.decision.options.push({ id: storage.createId('opt'), name: '', description: '' });
  renderOptionEditors();
  updateSetupCounts();
  markDirty();
  const inputs = $$('.option-name-input');
  inputs[inputs.length - 1]?.focus();
}

async function removeOption(optionId) {
  if (!state.decision || state.decision.options.length <= 2) return;
  const option = state.decision.options.find((entry) => entry.id === optionId);
  if (!option) return;

  if (optionHasRatings(optionId)) {
    const confirmed = await askConfirm({
      title: t('confirm.removeOption.title', { name: option.name || t('common.thisOption') }),
      body: t('confirm.removeOption.body'),
      confirmLabel: t('confirm.removeOption.confirm'),
    });
    if (!confirmed) return;
  }

  state.decision.options = state.decision.options.filter((entry) => entry.id !== optionId);
  delete state.decision.ratings[optionId];
  renderOptionEditors();
  updateSetupCounts();
  markDirty();
}

async function addCriterion() {
  if (!state.decision || state.decision.criteria.length >= 12) return;
  state.decision.criteria.push({ id: storage.createId('crit'), name: '', weight: 3 });
  renderCriterionEditors();
  updateSetupCounts();
  markDirty();
  const inputs = $$('.criterion-name-input');
  inputs[inputs.length - 1]?.focus();
}

async function removeCriterion(criterionId) {
  if (!state.decision || state.decision.criteria.length <= 1) return;
  const criterion = state.decision.criteria.find((entry) => entry.id === criterionId);
  if (!criterion) return;

  if (criterionHasRatings(criterionId)) {
    const confirmed = await askConfirm({
      title: t('confirm.removeCriterion.title', { name: criterion.name || t('common.thisCriterion') }),
      body: t('confirm.removeCriterion.body'),
      confirmLabel: t('confirm.removeCriterion.confirm'),
    });
    if (!confirmed) return;
  }

  state.decision.criteria = state.decision.criteria.filter((entry) => entry.id !== criterionId);
  state.decision.options.forEach((option) => {
    if (state.decision.ratings[option.id]) delete state.decision.ratings[option.id][criterionId];
  });
  renderCriterionEditors();
  updateSetupCounts();
  markDirty();
}

function continueToRating() {
  if (!validateSetup()) {
    showToast(t('setup.toast.attention'), { tone: 'error' });
    return;
  }
  state.step = 'rate';
  navigate(ROUTES.rate);
}

function initSetupEvents() {
  const title = $('#decisionTitle');
  const description = $('#decisionDescription');
  const descCount = $('#descCount');

  title?.addEventListener('input', () => {
    if (!state.decision) return;
    state.decision.title = title.value;
    clearFieldErrorFor(title);
    setDecisionTitle(title.value);
    markDirty();
  });

  description?.addEventListener('input', () => {
    if (!state.decision) return;
    state.decision.description = description.value;
    if (descCount) descCount.textContent = String(description.value.length);
    clearFieldErrorFor(description);
    markDirty();
  });

  $('#optionsList')?.addEventListener('input', (event) => {
    const input = event.target.closest('.option-name-input, .option-desc-input');
    if (!input || !state.decision) return;
    const card = input.closest('[data-option-id]');
    const option = state.decision.options.find((entry) => entry.id === card?.dataset.optionId);
    if (!option) return;
    option[input.dataset.field] = input.value;
    clearFieldErrorFor(input);
    markDirty();
  });

  $('#optionsList')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-option]');
    if (button) removeOption(button.dataset.removeOption);
  });

  $('#criteriaList')?.addEventListener('input', (event) => {
    const input = event.target.closest('.criterion-name-input, .weight-range');
    if (!input || !state.decision) return;
    const row = input.closest('[data-criterion-id]');
    const criterion = state.decision.criteria.find((entry) => entry.id === row?.dataset.criterionId);
    if (!criterion) return;

    if (input.classList.contains('weight-range')) {
      const value = Number(input.value);
      criterion.weight = value;
      input.style.setProperty('--weight-pct', `${(value / 5) * 100}%`);
      const output = row.querySelector('.weight-control-label output');
      if (output) output.textContent = t('setup.weightValue', { weight: value });
      input.removeAttribute('aria-invalid');
      const weightError = document.getElementById(`crit-weight-error-${criterion.id}`);
      if (weightError) weightError.textContent = '';
    } else {
      criterion.name = input.value;
      clearFieldErrorFor(input);
    }
    markDirty();
  });

  $('#criteriaList')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-criterion]');
    if (button) removeCriterion(button.dataset.removeCriterion);
  });

  $('#addOption')?.addEventListener('click', addOption);
  $('#addCriterion')?.addEventListener('click', addCriterion);
  $('#toRating')?.addEventListener('click', continueToRating);
  $('#saveDecisionBtn')?.addEventListener('click', () => {
    saveCurrentDecision();
  });
  $('#newBlank')?.addEventListener('click', async () => {
    const reset = await resetToBlank();
    if (reset) {
      state.step = 'setup';
      navigate(ROUTES.setup);
      showToast(t('setup.toast.blank'), { tone: 'note' });
    }
  });

  $('#setupForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    continueToRating();
  });
}


/* ============================================================
   Studio rendering
   ============================================================ */
function getRatingStats() {
  const decision = state.decision;
  if (!decision) return { total: 0, filled: 0, perOption: new Map(), complete: false };
  const perOption = new Map();
  let filled = 0;
  decision.options.forEach((option) => {
    let optionFilled = 0;
    decision.criteria.forEach((criterion) => {
      const value = ratingValue(decision, option.id, criterion.id);
      if (value !== null) {
        filled += 1;
        optionFilled += 1;
      }
    });
    perOption.set(option.id, { filled: optionFilled, total: decision.criteria.length });
  });
  return {
    total: decision.options.length * decision.criteria.length,
    filled,
    perOption,
    complete: filled === decision.options.length * decision.criteria.length && decision.criteria.length > 0,
  };
}

function missingRatingEntries() {
  const decision = state.decision;
  if (!decision) return [];
  const missing = [];
  decision.options.forEach((option) => {
    decision.criteria.forEach((criterion) => {
      if (ratingValue(decision, option.id, criterion.id) === null) missing.push({ option, criterion });
    });
  });
  return missing;
}

function hasAllRatings() {
  return missingRatingEntries().length === 0 && Boolean(state.decision?.criteria.length);
}

function renderStudio() {
  const decision = state.decision;
  if (!decision) return;

  const title = $('#studioTitle');
  const eyebrow = $('#studioEyebrow');
  if (title) title.textContent = decision.title?.trim() || t('studio.untitled');
  if (eyebrow) {
    eyebrow.textContent = state.dirty
      ? t('studio.draft')
      : state.savedCurrent
        ? t('studio.saved')
        : t('studio.new');
  }
  updateSaveState();

  const stepOrder = ['setup', 'rate', 'report'];
  $$('.step-tab').forEach((tab) => {
    const step = tab.dataset.step;
    tab.classList.remove('is-incomplete');
    if (step === state.step) tab.setAttribute('aria-current', 'step');
    else tab.removeAttribute('aria-current');
    if (step === 'report' && (!hasValidSetup(decision) || !hasAllRatings())) {
      tab.classList.add('is-incomplete');
    }
  });

  const progress = $('#stepProgressBar');
  if (progress) {
    const pct = state.step === 'setup' ? 8 : state.step === 'rate' ? 38 : 68;
    progress.style.width = `${pct}%`;
  }

  $('#setupPanel').hidden = state.step !== 'setup';
  $('#ratePanel').hidden = state.step !== 'rate';
  $('#reportPanel').hidden = state.step !== 'report';

  if (state.step === 'setup') renderSetup();
  if (state.step === 'rate') renderRating();
  if (state.step === 'report') renderReport();
}

/* ============================================================
   Rating workspace
   ============================================================ */
function createRatingSelect(option, criterion, suffix) {
  const current = ratingValue(state.decision, option.id, criterion.id);
  const selectId = `rating-${suffix}-${option.id}-${criterion.id}`;

  const select = el('select', {
    class: 'score-select',
    attrs: {
      id: selectId,
      'aria-label': t('rate.aria', {
        option: option.name || t('common.thisOption'),
        criterion: criterion.name || t('common.thisCriterion'),
      }),
      'data-rating-option': option.id,
      'data-rating-criterion': criterion.id,
    },
  });
  select.append(el('option', { attrs: { value: '' }, text: '–' }));
  for (let score = 0; score <= 10; score += 1) {
    select.append(el('option', { attrs: { value: String(score) }, text: String(score) }));
  }
  if (current !== null) select.value = String(current);
  if (current === null) select.classList.add('is-unrated');

  const meter = el('span', { class: 'rating-meter', attrs: { 'aria-hidden': 'true' } }, [
    el('span', { attrs: { style: `--fill: ${current === null ? 0 : current * 10}%` } }),
  ]);

  const field = el('label', { class: 'rating-field', attrs: { for: selectId } }, [
    el('span', {
      class: 'sr-only',
      text: `${criterion.name || t('common.untitledCriterion')} — ${option.name || t('common.untitledOption')}`,
    }),
    el('span', { class: 'score-select-wrap' }, [select, meter]),
  ]);

  return field;
}

function renderRatingCards() {
  const cards = el('div', { class: 'rating-cards', attrs: { 'aria-label': t('rate.cards') } });
  state.decision.options.forEach((option) => {
    const stats = getRatingStats().perOption.get(option.id);
    const rows = state.decision.criteria.map((criterion) =>
      el('div', { class: `rating-card-row${ratingValue(state.decision, option.id, criterion.id) === null ? ' is-unrated' : ''}` }, [
        el('div', { class: 'rating-card-row-label' }, [
          el('strong', { text: criterion.name || t('rate.untitledCriterion') }),
          el('small', { text: t('rate.importance', { weight: criterion.weight }) }),
        ]),
        createRatingSelect(option, criterion, 'mobile'),
      ])
    );

    cards.append(
      el('section', {
        class: 'rating-card',
        attrs: { 'aria-label': t('rate.ratingsFor', { option: option.name || t('rate.untitledOption') }) },
      }, [
        el('div', { class: 'rating-card-head' }, [
          el('h3', { text: option.name || t('rate.untitledOption') }),
          el('span', {
            text: t('rate.rated', { filled: stats?.filled || 0, total: stats?.total || 0 }),
            dataset: { optionProgress: option.id },
          }),
        ]),
        ...rows,
      ])
    );
  });
  return cards;
}

function renderRatingWorkspace() {
  const workspace = $('#ratingWorkspace');
  if (!workspace) return;
  workspace.replaceChildren();

  const matrix = el('div', {
    class: 'rate-matrix',
    attrs: { role: 'group', 'aria-label': t('rate.matrix') },
  });
  matrix.style.setProperty('--option-count', String(state.decision.options.length));

  const head = el('div', { class: 'matrix-head' }, [
    el('div', { class: 'matrix-corner' }, [t('rate.corner')]),
    ...state.decision.options.map((option) =>
      el('div', { class: 'matrix-option-head' }, [
        el('strong', { text: option.name || t('rate.untitledOption') }),
        el('span', { text: t('rate.rate010') }),
      ])
    ),
  ]);
  matrix.append(head);

  state.decision.criteria.forEach((criterion) => {
    const row = el('div', { class: 'matrix-row' }, [
      el('div', { class: 'criterion-cell' }, [
        el('strong', { text: criterion.name || t('rate.untitledCriterion') }),
        el('span', { class: 'weight-badge', text: `×${criterion.weight}` }),
      ]),
      ...state.decision.options.map((option) => {
        const current = ratingValue(state.decision, option.id, criterion.id);
        return el('div', { class: `rating-cell${current === null ? ' is-unrated' : ''}` }, [
          createRatingSelect(option, criterion, 'desktop'),
        ]);
      }),
    ]);
    matrix.append(row);
  });

  workspace.append(matrix, renderRatingCards());
}

function updateRatingProgress() {
  const stats = getRatingStats();
  const label = $('#ratingProgressLabel');
  const bar = $('#ratingProgressBar');
  if (label) label.textContent = `${stats.filled} / ${stats.total}`;
  if (bar) bar.style.width = `${stats.total ? (stats.filled / stats.total) * 100 : 0}%`;

  $$('[data-option-progress]').forEach((node) => {
    const progress = stats.perOption.get(node.dataset.optionProgress);
    if (progress) node.textContent = t('rate.rated', progress);
  });
}

function syncRatingControl(optionId, criterionId) {
  const value = ratingValue(state.decision, optionId, criterionId);
  $$('.score-select').forEach((select) => {
    if (select.dataset.ratingOption !== optionId || select.dataset.ratingCriterion !== criterionId) return;
    select.value = value === null ? '' : String(value);
    select.classList.toggle('is-unrated', value === null);
    select.classList.remove('is-missing');
    const wrapper = select.closest('.rating-cell, .rating-card-row');
    wrapper?.classList.toggle('is-unrated', value === null);
    wrapper?.classList.remove('is-missing');
    const meterFill = select.closest('.rating-field')?.querySelector('.rating-meter span');
    if (meterFill) meterFill.style.setProperty('--fill', `${value === null ? 0 : value * 10}%`);
  });
}

function renderRatingPreview() {
  const container = $('#livePreview');
  if (!container) return;
  container.replaceChildren();

  const stats = getRatingStats();
  const head = el('div', { class: 'preview-head' }, [
    el('div', {}, [
      el('h3', { text: t('rate.preview.title') }),
      el('p', { text: t('rate.preview.copy') }),
    ]),
    el('span', {
      class: `preview-status${stats.complete ? ' is-ready' : ''}`,
      text: stats.complete
        ? t('rate.preview.ready')
        : t('rate.preview.left', { count: stats.total - stats.filled }),
    }),
  ]);
  container.append(head);

  if (!stats.complete) {
    container.append(
      el('p', {
        class: 'preview-empty',
        text: plural('rate.preview.add', stats.total - stats.filled),
      })
    );
  } else {
    const result = explainResults(state.decision);
    if (!result.ok) {
      container.append(el('p', { class: 'preview-empty', text: t('rate.preview.error') }));
    } else {
      const topIds = new Set(result.isTie ? result.tiedOptions.map((entry) => entry.optionId) : [result.leader.optionId]);
      const rows = el('div', { class: 'preview-rows' });
      result.sortedScores.forEach((score) => {
        const isLeader = topIds.has(score.optionId);
        rows.append(
          el('div', { class: `preview-row${isLeader ? ' is-leader' : ''}` }, [
            el('span', { class: 'preview-name', text: score.optionName }),
            el('span', { class: 'preview-bar', attrs: { 'aria-hidden': 'true' } }, [
              el('span', { attrs: { style: `--fill: ${Math.max(score.score, 1.5)}%` } }),
            ]),
            el('span', { class: 'preview-score', text: fmt(score.score) }),
          ])
        );
      });
      container.append(rows);
      container.append(
        el('p', {
          class: 'preview-empty',
          style: 'margin-top:14px;padding:10px 12px;border-style:solid',
          text: result.isTie
            ? t('rate.preview.tie', { precision: TIE_PRECISION.toFixed(2) })
            : t('rate.preview.lead', { name: result.leader.optionName }),
        })
      );
    }
  }

  const progressRow = el('div', { class: 'preview-option-progress' });
  state.decision.options.forEach((option) => {
    const progress = stats.perOption.get(option.id);
    progressRow.append(
      el('span', {
        class: progress && progress.filled === progress.total ? 'is-complete' : '',
        text: t('rate.preview.progress', {
          name: option.name || t('rate.preview.untitled'),
          filled: progress?.filled || 0,
          total: progress?.total || 0,
        }),
      })
    );
  });
  container.append(progressRow);
}

function renderRating() {
  renderRatingWorkspace();
  updateRatingProgress();
  renderRatingPreview();
  const summary = $('#ratingErrorSummary');
  if (summary) {
    summary.hidden = true;
    summary.replaceChildren();
  }
}

function validateRatings({ focus = true, announce = true, silent = false } = {}) {
  const missing = missingRatingEntries();
  const summary = $('#ratingErrorSummary');

  if (!missing.length) {
    $$('.score-select.is-missing').forEach((select) => select.classList.remove('is-missing'));
    $$('.rating-cell.is-missing, .rating-card-row.is-missing').forEach((node) => node.classList.remove('is-missing'));
    if (!silent && summary) {
      summary.hidden = true;
      summary.replaceChildren();
    }
    return true;
  }

  $$('.score-select').forEach((select) => {
    const match = missing.some(
      (entry) => entry.option.id === select.dataset.ratingOption && entry.criterion.id === select.dataset.ratingCriterion
    );
    select.classList.toggle('is-missing', match);
    const wrapper = select.closest('.rating-cell, .rating-card-row');
    wrapper?.classList.toggle('is-missing', match);
  });

  if (!silent && summary && announce) {
    summary.hidden = false;
    summary.replaceChildren();
    summary.append(
      el('strong', { text: plural('rate.summary.needed', missing.length) }),
      el('ul', {}, missing.slice(0, 4).map((entry) =>
        el('li', {
          text: t('rate.summary.entry', {
            option: entry.option.name || t('rate.untitledOption'),
            criterion: entry.criterion.name || t('rate.untitledCriterion'),
          }),
        })
      ))
    );
    if (missing.length > 4) {
      summary.append(el('p', { text: t('rate.summary.more', { count: missing.length - 4 }) }));
    }
  }

  if (focus) {
    const first = missing[0];
    const target =
      $$('.score-select').find(
        (select) =>
          select.dataset.ratingOption === first.option.id &&
          select.dataset.ratingCriterion === first.criterion.id &&
          select.offsetParent !== null
      ) || null;
    if (target) {
      target.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
      target.focus({ preventScroll: true });
    }
  }

  return false;
}

function clearAllRatings() {
  const hasAny = state.decision.options.some((option) => optionHasRatings(option.id));
  if (!hasAny) {
    showToast(t('rate.toast.none'), { tone: 'note' });
    return;
  }
  state.decision.options.forEach((option) => {
    state.decision.ratings[option.id] = {};
  });
  markDirty();
  renderRating();
  showToast(t('rate.toast.cleared'));
}

function initRatingEvents() {
  $('#ratingWorkspace')?.addEventListener('change', (event) => {
    const select = event.target.closest('.score-select');
    if (!select || !state.decision) return;
    const optionId = select.dataset.ratingOption;
    const criterionId = select.dataset.ratingCriterion;
    if (!state.decision.ratings[optionId]) state.decision.ratings[optionId] = {};
    if (select.value === '') delete state.decision.ratings[optionId][criterionId];
    else state.decision.ratings[optionId][criterionId] = Number(select.value);

    markDirty();
    syncRatingControl(optionId, criterionId);
    updateRatingProgress();
    renderRatingPreview();
    const summary = $('#ratingErrorSummary');
    if (summary && missingRatingEntries().length === 0) {
      summary.hidden = true;
      summary.replaceChildren();
    }
  });

  $('#clearRatings')?.addEventListener('click', clearAllRatings);

  $('#backToSetup')?.addEventListener('click', () => {
    state.step = 'setup';
    navigate(ROUTES.setup);
  });

  $('#toResults')?.addEventListener('click', () => {
    if (!validateRatings()) {
      showToast(t('rate.toast.addAll'), { tone: 'error' });
      return;
    }
    state.step = 'report';
    navigate(ROUTES.report);
  });
}

function initStepNavigation() {
  $$('.step-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.step;
      if (target === 'setup') {
        state.step = 'setup';
        navigate(ROUTES.setup);
        return;
      }
      if (!hasValidSetup()) {
        state.step = 'setup';
        navigate(ROUTES.setup);
        window.setTimeout(() => validateSetup(), 80);
        showToast(t('rate.toast.finishSetup'), { tone: 'error' });
        return;
      }
      if (target === 'rate') {
        state.step = 'rate';
        navigate(ROUTES.rate);
        return;
      }
      if (target === 'report') {
        if (!hasAllRatings()) {
          state.step = 'rate';
          navigate(ROUTES.rate);
          window.setTimeout(() => validateRatings(), 80);
          showToast(t('rate.toast.addAll'), { tone: 'note' });
          return;
        }
        state.step = 'report';
        navigate(ROUTES.report);
      }
    });
  });
}


/* ============================================================
   Clarity report
   ============================================================ */
function reportSection(index, title, subtitle, className = '') {
  const section = el('section', {
    class: `report-section${className ? ` ${className}` : ''}`,
    attrs: { 'aria-labelledby': `report-section-${index}` },
  });
  const head = el('div', { class: 'report-section-head' }, [
    el('div', {}, [
      el('h3', { attrs: { id: `report-section-${index}` }, text: title }),
      subtitle ? el('p', { text: subtitle }) : null,
    ]),
    el('span', { class: 'report-section-index', text: pad(index) }),
  ]);
  section.append(head);
  return section;
}

function pairExplanation(pair, leaderName, targetName) {
  if (!pair) return '';
  if (Math.abs(pair.delta) <= TIE_PRECISION) {
    return t('report.pair.tieNote', {
      a: leaderName,
      b: targetName,
      precision: TIE_PRECISION.toFixed(2),
    });
  }
  const gain = pair.advantagesA[0];
  const give = pair.advantagesB[0];
  const parts = [];
  if (gain) {
    parts.push(t('report.pair.gain', {
      leader: leaderName,
      criterion: gain.criterionName,
      a: gain.aRating,
      b: gain.bRating,
      weight: gain.weight,
      points: fmt(gain.weightedDelta),
    }));
  }
  if (give) {
    parts.push(t('report.pair.give', {
      target: targetName,
      criterion: give.criterionName,
      a: give.aRating,
      b: give.bRating,
      points: fmt(Math.abs(give.weightedDelta)),
    }));
  }
  return t('report.pair.join', { parts: parts.join(t('report.pair.joiner')) });
}

function tradeoffLine(kind, insight) {
  if (!insight) return null;
  return el('div', { class: `tradeoff-line is-${kind}` }, [
    el('span', { text: t(kind === 'strength' ? 'report.tradeoff.strong' : 'report.tradeoff.weak') }),
    el('strong', { text: `${insight.criterionName} · ${insight.rating}/10` }),
    el('em', {
      text: t('report.tradeoff.meta', {
        weight: insight.weight,
        points: fmt(insight.contribution),
      }),
    }),
  ]);
}

function buildTradeoffCard(option, insights) {
  return el('div', { class: 'tradeoff-card' }, [
    el('h4', { text: option.name || t('report.untitledOption') }),
    tradeoffLine('strength', insights?.strongest),
    tradeoffLine('weakness', insights?.weakest),
  ]);
}

function renderReport() {
  const panel = $('#reportPanel');
  if (!panel) return;
  panel.replaceChildren();

  if (!state.decision) return;

  const result = explainResults(state.decision);
  if (!result.ok) {
    const empty = el('div', { class: 'report-empty' }, [
      el('h3', { text: t('report.empty.title') }),
      el('p', { text: t('report.empty.body') }),
      el('button', {
        class: 'btn btn-primary',
        attrs: { type: 'button', 'data-report-action': 'rate' },
        text: t('report.empty.return'),
      }),
    ]);
    panel.append(empty);
    return;
  }

  const decision = state.decision;
  const leaderId = result.leader.optionId;
  const topIds = new Set(result.isTie ? result.tiedOptions.map((entry) => entry.optionId) : [leaderId]);
  const pairTarget = result.isTie ? result.tiedOptions[1] || null : result.runnerUp;
  const pair = pairTarget ? compareOptions(decision, leaderId, pairTarget.optionId) : null;
  const targetName = pairTarget ? pairTarget.optionName || pairTarget.name : '';
  const leaderName = result.leader.optionName;

  /* Head */
  const head = el('div', { class: 'report-head' }, [
    el('div', {}, [
      el('p', { class: 'eyebrow' }, [el('span', { class: 'eyebrow-dot' }), t('report.eyebrow')]),
      el('h2', { attrs: { id: 'reportHeading' }, text: t('report.heading') }),
      el('p', {
        class: 'report-meta',
        text: t('report.meta', {
          title: decision.title || t('studio.untitled'),
          options: plural('common.options', decision.options.length),
          criteria: plural('common.priorities', decision.criteria.length),
        }),
      }),
    ]),
    el('div', { class: 'report-head-actions' }, [
      el('button', {
        class: 'btn btn-outline btn-sm',
        attrs: { type: 'button', 'data-report-action': 'setup' },
      }, [icon('edit'), t('report.edit')]),
      el('button', {
        class: 'btn btn-outline btn-sm',
        attrs: { type: 'button', 'data-report-action': 'print' },
      }, [icon('print'), t('report.print')]),
    ]),
  ]);

  /* Hero */
  const statement = el('p', { class: 'report-statement' });
  const tiedNames = formatList(result.tiedOptions.map((entry) => entry.optionName));
  if (result.isTie) {
    statement.append(document.createTextNode(t('report.statement.tie', { names: tiedNames })));
  } else {
    statement.append(
      document.createTextNode(t('report.statement.lead')),
      el('strong', { text: leaderName }),
      document.createTextNode(t('report.statement.tail'))
    );
  }

  const scoreNames = result.isTie
    ? result.tiedOptions.map((entry) => entry.optionName).join(' · ')
    : leaderName;
  const marginText = result.isTie
    ? t('report.margin.tie', { precision: TIE_PRECISION.toFixed(2) })
    : t('report.margin.lead', {
        leader: leaderName,
        runner: result.runnerUp?.optionName || '',
        margin: fmt(result.margin),
      });

  const hero = el('section', { class: 'report-hero', attrs: { 'aria-label': t('report.heading') } }, [
    el('div', {}, [
      el('p', {
        class: 'eyebrow',
        text: t(result.isTie ? 'report.result.close' : 'report.result.closest'),
      }),
      statement,
      el('p', { class: 'report-margin', text: marginText }),
      el('div', { class: 'report-tags' }, [
        el('span', { class: 'report-tag', text: t('report.tag.weighted') }),
        el('span', {
          class: 'report-tag',
          text: tn('common.ratings', decision.options.length * decision.criteria.length),
        }),
        el('span', { class: 'report-tag', text: t('report.tag.totalWeight', { weight: result.totalWeight }) }),
        result.isTie
          ? el('span', {
              class: 'report-tag is-tie',
              text: t('report.tag.tie', { precision: TIE_PRECISION.toFixed(2) }),
            })
          : null,
      ]),
    ]),
    el('div', { class: 'report-score-main' }, [
      el('span', {
        class: 'report-score-label',
        text: t(result.isTie ? 'report.score.joint' : 'report.score.top'),
      }),
      el('strong', {}, [fmt(result.leader.score), el('small', { text: '/100' })]),
      el('span', { class: 'report-score-name', text: scoreNames }),
      el('span', {
        class: 'report-score-note',
        text: t(result.isTie ? 'report.score.tieNote' : 'report.score.note'),
      }),
    ]),
  ]);

  panel.append(head, hero);

  if (result.isTie) {
    panel.append(
      el('div', { class: 'tie-banner' }, [
        el('span', { class: 'tie-mark', attrs: { 'aria-hidden': 'true' }, text: '≈' }),
        el('div', {}, [
          el('h3', { text: t('report.tie.title') }),
          el('p', {
            text: t('report.tie.body', {
              names: tiedNames,
              precision: TIE_PRECISION.toFixed(2),
            }),
          }),
        ]),
      ])
    );
  }

  /* Score chart */
  const chartSection = reportSection(
    2,
    t('report.section.scores.title'),
    t('report.section.scores.sub')
  );
  const chart = el('div', { class: 'score-chart' });
  const scale = el('div', { class: 'chart-scale', attrs: { 'aria-hidden': 'true' } }, [
    el('span', { text: '0' }),
    el('span', { text: '25' }),
    el('span', { text: '50' }),
    el('span', { text: '75' }),
    el('span', { text: '100' }),
  ]);
  chart.append(scale);

  result.sortedScores.forEach((score) => {
    const isLeader = topIds.has(score.optionId);
    const row = el('div', { class: `score-row${isLeader ? ' is-leader' : ''}${result.isTie && isLeader ? ' is-tied' : ''}` }, [
      el('div', { class: 'score-option' }, [
        el('h4', {}, [
          el('span', { class: 'rank-index', text: pad(score.rank) }),
          document.createTextNode(score.optionName || t('report.untitledOption')),
          isLeader
            ? el('span', {
                class: `leader-badge${result.isTie ? ' tie-badge' : ''}`,
                text: t(result.isTie ? 'report.leader.tied' : 'report.leader.top'),
              })
            : null,
        ]),
        score.optionDescription ? el('p', { text: score.optionDescription }) : null,
      ]),
      el('div', { class: 'score-bar-wrap' }, [
        el('div', {
          class: 'score-bar',
          attrs: {
            role: 'img',
            'aria-label': t('report.chart.aria', { option: score.optionName, score: fmt(score.score) }),
          },
        }, [el('span', { attrs: { style: `--score: ${score.score}%` } })]),
      ]),
      el('div', { class: 'score-number' }, [fmt(score.score), el('small', { text: '/100' })]),
    ]);
    chart.append(row);
  });
  chartSection.append(chart);
  panel.append(chartSection);
  requestAnimationFrame(() => chart.classList.add('is-ready'));

  /* Weights + influence */
  const grid = el('div', { class: 'report-grid' });
  const prioritySection = reportSection(
    3,
    t('report.section.weights.title'),
    t('report.section.weights.sub')
  );
  const weightList = el('div', { class: 'weight-list' });
  [...decision.criteria]
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name))
    .forEach((criterion) => {
      weightList.append(
        el('div', { class: `weight-row${criterion.weight <= 3 ? ' is-secondary' : ''}` }, [
          el('span', { class: 'weight-name', text: criterion.name }),
          el('span', { class: 'weight-value' }, [el('strong', { text: String(criterion.weight) }), ' / 5']),
          el('div', { class: 'weight-track', attrs: { 'aria-hidden': 'true' } }, [
            el('span', { attrs: { style: `--weight-width: ${(criterion.weight / 5) * 100}%` } }),
          ]),
        ])
      );
    });
  prioritySection.append(weightList);
  grid.append(prioritySection);

  const influenceSection = reportSection(
    4,
    t('report.section.influence.title'),
    t('report.section.influence.sub')
  );
  if (result.influence.length) {
    const maxSpread = Math.max(...result.influence.map((entry) => entry.weightedSpread), 0.001);
    const list = el('div', { class: 'influence-list' });
    result.influence.slice(0, 4).forEach((entry, index) => {
      list.append(
        el('div', { class: 'influence-item' }, [
          el('span', { class: 'influence-index', text: pad(index + 1) }),
          el('div', { class: 'influence-body' }, [
            el('strong', {
              text: t('report.influence.entry', {
                criterion: entry.criterionName,
                weight: entry.weight,
              }),
            }),
            el('p', {
              text:
                entry.spread === 0
                  ? t('report.influence.none', {
                      min: entry.minRating,
                      criterion: entry.criterionName,
                    })
                  : t('report.influence.spread', {
                      criterion: entry.criterionName,
                      spread: entry.spread,
                      weight: entry.weight,
                      share: entry.shareOfScale.toFixed(1),
                    }),
            }),
            el('div', { class: 'influence-meter', attrs: { 'aria-hidden': 'true' } }, [
              el('span', { attrs: { style: `--fill: ${(entry.weightedSpread / maxSpread) * 100}%` } }),
            ]),
          ]),
        ])
      );
    });
    influenceSection.append(list);
  } else {
    influenceSection.append(el('p', { class: 'preview-empty', text: t('report.influence.empty') }));
  }
  if (result.highWeightCriteria.length) {
    influenceSection.append(
      el('div', { class: 'example-weights' }, result.highWeightCriteria.map((criterion) =>
        el('span', { class: 'weight-chip' }, [
          document.createTextNode(`${criterion.name} `),
          el('strong', { text: `${criterion.weight}/5` }),
        ])
      ))
    );
  }
  grid.append(influenceSection);
  panel.append(grid);

  /* Criterion table */
  const tableSection = reportSection(
    5,
    t('report.section.table.title'),
    t('report.section.table.sub')
  );
  const table = el('table', { class: 'compare-table' });
  table.append(el('caption', { class: 'sr-only', text: t('report.table.caption') }));
  const thead = el('thead');
  const headRow = el('tr');
  headRow.append(el('th', { attrs: { scope: 'col' }, text: t('report.table.criterion') }));
  decision.options.forEach((option) => {
    headRow.append(
      el('th', { attrs: { scope: 'col' }, text: option.name || t('report.untitledOption') })
    );
  });
  thead.append(headRow);
  table.append(thead);

  const tbody = el('tbody');
  decision.criteria.forEach((criterion) => {
    const row = el('tr');
    row.append(
      el('th', { attrs: { scope: 'row' } }, [
        el('span', { class: 'table-criterion' }, [
          el('span', { text: criterion.name || t('common.untitledCriterion') }),
          el('small', { text: t('report.table.weight', { weight: criterion.weight }) }),
        ]),
      ])
    );
    const ratings = decision.options.map((option) => ratingValue(decision, option.id, criterion.id));
    const highest = Math.max(...ratings.filter((value) => typeof value === 'number'));
    decision.options.forEach((option, index) => {
      const value = ratings[index];
      const isHighest = value === highest;
      row.append(
        el('td', { attrs: { 'data-label': option.name || t('report.untitledOption') } }, [
          el('span', {
            class: `table-rating${isHighest ? ' is-highest' : ''}`,
          }, [
            String(value),
            el('small', { text: '/10' }),
            isHighest ? el('span', { class: 'highest-tag', text: t('report.table.highest') }) : null,
          ]),
        ])
      );
    });
    tbody.append(row);
  });
  table.append(tbody);
  tableSection.append(el('div', { class: 'table-wrap' }, [table]));
  panel.append(tableSection);

  /* Pairwise */
  if (pair && pairTarget) {
    const pairSection = reportSection(
      6,
      t('report.section.pair.title'),
      t('report.section.pair.sub')
    );
    pairSection.append(
      el('div', { class: 'pairwise-head' }, [
        el('div', { class: 'pair-names' }, [
          el('span', { text: t('report.pair.a', { name: leaderName }) }),
          el('span', { class: 'vs', text: t('report.pair.vs') }),
          el('span', {
            text: t('report.pair.b', { name: targetName || pairTarget.optionName }),
          }),
        ]),
        el('p', {
          class: 'report-meta',
          text: t('report.pair.meta', {
            a: fmt(pair.optionA.score),
            b: fmt(pair.optionB.score),
          }),
        }),
      ])
    );

    const rows = [...pair.rows].sort((a, b) => Math.abs(b.weightedDelta) - Math.abs(a.weightedDelta));
    const rowList = el('div', { class: 'pairwise-rows' });
    rows.forEach((entry) => {
      const directionClass = entry.deltaRating > 0 ? 'favours-a' : entry.deltaRating < 0 ? 'favours-b' : '';
      rowList.append(
        el('div', { class: 'pairwise-row' }, [
          el('div', { class: 'pairwise-criterion' }, [
            el('span', { text: entry.criterionName }),
            el('small', { text: t('report.table.weight', { weight: entry.weight }) }),
          ]),
          el('div', { class: 'duo-bar' }, [
            el('div', { class: 'duo-bar-row is-a' }, [
              el('span', { text: 'A' }),
              el('span', { class: 'mini-track' }, [
                el('i', { attrs: { style: `--fill: ${entry.aRating * 10}%` } }),
              ]),
              el('em', { text: String(entry.aRating) }),
            ]),
            el('div', { class: 'duo-bar-row' }, [
              el('span', { text: 'B' }),
              el('span', { class: 'mini-track' }, [
                el('i', { attrs: { style: `--fill: ${entry.bRating * 10}%` } }),
              ]),
              el('em', { text: String(entry.bRating) }),
            ]),
          ]),
          el('span', {
            class: `pairwise-delta ${directionClass}`,
            text:
              entry.deltaRating === 0
                ? t('report.pair.level')
                : t('report.pair.pts', { delta: fmtDelta(entry.weightedDelta) }),
            attrs: {
              'aria-label':
                entry.deltaRating === 0
                  ? t('report.pair.ariaLevel', { criterion: entry.criterionName })
                  : t('report.pair.ariaLead', {
                      criterion: entry.criterionName,
                      side: t(entry.deltaRating > 0 ? 'report.pair.sideA' : 'report.pair.sideB'),
                      delta: fmt(Math.abs(entry.weightedDelta)),
                    }),
            },
          }),
        ])
      );
    });
    pairSection.append(rowList);
    pairSection.append(el('p', { class: 'pairwise-note', text: pairExplanation(pair, leaderName, targetName || pairTarget.optionName) }));
    panel.append(pairSection);
  }

  /* Tradeoffs */
  const tradeoffSection = reportSection(
    7,
    t('report.section.shape.title'),
    t('report.section.shape.sub')
  );
  const tradeoffGrid = el('div', { class: 'tradeoff-grid' });
  decision.options.forEach((option) => {
    tradeoffGrid.append(buildTradeoffCard(option, result.insights[option.id]));
  });
  tradeoffSection.append(tradeoffGrid);
  panel.append(tradeoffSection);

  /* Caveat + actions */
  panel.append(
    el('div', { class: 'report-caveat' }, [
      el('span', { class: 'caveat-mark', attrs: { 'aria-hidden': 'true' }, text: '¶' }),
      el('p', {
        text: t('report.caveat', {
          note: t('report.note'),
          precision: TIE_PRECISION.toFixed(2),
        }),
      }),
    ])
  );

  const actions = el('div', { class: 'report-actions' });
  actions.append(
    el('button', {
      class: 'btn btn-outline btn-sm',
      attrs: { type: 'button', 'data-report-action': 'setup' },
    }, [icon('edit'), t('report.edit')]),
    el('button', {
      class: 'btn btn-ghost btn-sm',
      attrs: { type: 'button', 'data-report-action': 'rate' },
    }, [t('report.actions.adjust')]),
    el('span', { class: 'action-spacer' }),
    el('button', {
      class: 'btn btn-quiet btn-sm',
      attrs: { type: 'button', 'data-report-action': 'recalculate' },
    }, [icon('refresh'), t('report.actions.recalc')]),
    el('button', {
      class: 'btn btn-outline btn-sm',
      attrs: { type: 'button', 'data-report-action': 'duplicate' },
    }, [icon('copy'), t('report.actions.duplicate')]),
    el('button', {
      class: 'btn btn-primary btn-sm',
      attrs: { type: 'button', 'data-report-action': 'save', 'data-report-save': '' },
    }, [icon('save'), t(state.savedCurrent ? 'save.update' : 'save.save')]),
    el('button', {
      class: 'danger-link',
      attrs: { type: 'button', 'data-report-action': 'restart' },
      text: t('report.actions.startOver'),
    })
  );
  panel.append(actions);
  updateSaveState();
}

function initReportEvents() {
  $('#reportPanel')?.addEventListener('click', async (event) => {
    const actionButton = event.target.closest('[data-report-action]');
    if (!actionButton) return;
    const action = actionButton.dataset.reportAction;

    if (action === 'setup') {
      state.step = 'setup';
      navigate(ROUTES.setup);
      return;
    }
    if (action === 'rate') {
      state.step = 'rate';
      navigate(ROUTES.rate);
      return;
    }
    if (action === 'recalculate') {
      if (!hasAllRatings() || !hasValidSetup()) {
        showToast(t('toast.finishRecalc'), { tone: 'error' });
        return;
      }
      renderReport();
      showToast(t('report.toast.recalc'));
      return;
    }
    if (action === 'print') {
      window.print();
      return;
    }
    if (action === 'save') {
      await saveCurrentDecision();
      return;
    }
    if (action === 'duplicate') {
      await duplicateCurrentDecision();
      return;
    }
    if (action === 'restart') {
      const confirmed = await askConfirm({
        title: t('confirm.restart.title'),
        body: t('confirm.restart.body'),
        confirmLabel: t('confirm.restart.confirm'),
      });
      if (!confirmed) return;
      state.decision = makeBlankDecision();
      state.dirty = false;
      state.savedCurrent = false;
      state.savedAt = null;
      state.step = 'setup';
      storage.clearDraft();
      navigate(ROUTES.setup);
      showToast(t('setup.toast.blank'), { tone: 'note' });
    }
  });
}


/* ============================================================
   Saving, duplicating, starting over
   ============================================================ */
async function saveCurrentDecision() {
  if (!state.decision) return false;
  if (!hasValidSetup()) {
    state.step = 'setup';
    navigate(ROUTES.setup);
    window.setTimeout(() => validateSetup(), 80);
    showToast(t('toast.finishSetupSave'), { tone: 'error' });
    return false;
  }
  if (!hasAllRatings()) {
    state.step = 'rate';
    navigate(ROUTES.rate);
    window.setTimeout(() => validateRatings(), 80);
    showToast(t('toast.allRatingsSave'), { tone: 'error' });
    return false;
  }

  const now = new Date().toISOString();
  const payload = {
    ...state.decision,
    title: state.decision.title.trim(),
    description: state.decision.description.trim(),
    options: state.decision.options.map((option) => ({
      ...option,
      name: option.name.trim(),
      description: (option.description || '').trim(),
    })),
    criteria: state.decision.criteria.map((criterion) => ({
      ...criterion,
      name: criterion.name.trim(),
    })),
    ratings: Object.fromEntries(
      Object.entries(state.decision.ratings).map(([optionId, ratings]) => [optionId, { ...ratings }])
    ),
    updatedAt: now,
    completedAt: state.decision.completedAt || now,
  };

  const result = storage.saveDecision(payload);
  if (!result.ok) {
    showToast(localizeStorageError(result.error) || t('toast.decisionSave'), { tone: 'error' });
    return false;
  }

  state.decision = normalizeForEditing(result.decision);
  state.decision.completedAt = result.decision.completedAt;
  state.decision.updatedAt = result.decision.updatedAt;
  state.dirty = false;
  state.savedCurrent = true;
  state.savedAt = result.decision.updatedAt;
  storage.clearDraft();
  updateSaveState();

  const eyebrow = $('#studioEyebrow');
  if (eyebrow) eyebrow.textContent = t('studio.saved');
  $$('[data-report-save]').forEach((button) => {
    button.replaceChildren(icon('save'), document.createTextNode(t('save.update')));
  });
  showToast(
    t(result.persistent ? 'toast.savedPersistent' : 'toast.savedSession'),
    { tone: result.persistent ? 'default' : 'note' }
  );
  return true;
}

function stripCopySuffix(title) {
  const labels = languages()
    .map((language) => t('duplicate.copy', {}, language))
    .filter(Boolean);
  const escaped = labels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const marker = new RegExp(`\\s*\\((?:copy|${escaped.join('|')})(?: \\d+)?\\)$`, 'i');
  return title.replace(marker, '').trim();
}

async function duplicateCurrentDecision() {
  if (!hasValidSetup()) {
    showToast(t('toast.finishSetupDuplicate'), { tone: 'error' });
    return;
  }
  if (!hasAllRatings()) {
    showToast(t('toast.finishRatingsDuplicate'), { tone: 'error' });
    return;
  }

  const baseTitle = stripCopySuffix(state.decision.title) || t('studio.untitled');
  const existingTitles = new Set(storage.readDecisions().decisions.map((record) => record.title.toLowerCase()));
  const copyWord = t('duplicate.copy');
  let title = `${baseTitle} (${copyWord})`.slice(0, 120);
  let attempt = 2;
  while (existingTitles.has(title.toLowerCase())) {
    title = `${baseTitle} (${copyWord} ${attempt})`.slice(0, 120);
    attempt += 1;
  }

  const now = new Date().toISOString();
  const copy = {
    ...state.decision,
    id: storage.createId('dec'),
    title,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
    options: state.decision.options.map((option) => ({ ...option })),
    criteria: state.decision.criteria.map((criterion) => ({ ...criterion })),
    ratings: Object.fromEntries(
      Object.entries(state.decision.ratings).map(([optionId, ratings]) => [optionId, { ...ratings }])
    ),
  };

  const result = storage.saveDecision(copy);
  if (!result.ok) {
    showToast(localizeStorageError(result.error) || t('toast.decisionDuplicate'), { tone: 'error' });
    return;
  }

  state.decision = normalizeForEditing(result.decision);
  state.decision.completedAt = result.decision.completedAt;
  state.dirty = false;
  state.savedCurrent = true;
  state.savedAt = result.decision.updatedAt;
  state.step = 'report';
  storage.clearDraft();
  navigate(ROUTES.report);
  showToast(
    t(result.persistent ? 'toast.copyReady' : 'saved.toast.copySession'),
    { tone: result.persistent ? 'default' : 'note' }
  );
}

/* ============================================================
   Landing: example + recent decisions
   ============================================================ */
function updatePresetButtons() {
  $$('[data-preset]').forEach((button) => {
    const active = button.dataset.preset === state.examplePreset;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderLandingExample() {
  const container = $('#exampleReport');
  if (!container) return;
  const decision = createSampleDecision(state.examplePreset);
  const result = explainResults(decision);
  container.replaceChildren();

  if (!result.ok) {
    container.append(el('p', { class: 'preview-empty', text: t('landing.example.error') }));
    return;
  }

  const topIds = new Set(result.isTie ? result.tiedOptions.map((entry) => entry.optionId) : [result.leader.optionId]);
  const preset = SAMPLE_PRESETS[state.examplePreset] || SAMPLE_PRESETS.balanced;
  const presetLabel = t(preset.labelKey);

  const top = el('div', { class: 'example-top' }, [
    el('div', {}, [
      el('p', {
        class: 'example-kicker',
        text: t('landing.example.kicker', { preset: presetLabel }),
      }),
      el('p', { class: 'example-statement' }, [
        document.createTextNode(
          result.isTie
            ? t('landing.example.tieLead', { precision: TIE_PRECISION.toFixed(2) })
            : t('landing.example.lead')
        ),
        el('strong', {
          text: result.isTie
            ? result.tiedOptions.map((entry) => entry.optionName).join(' / ')
            : result.leader.optionName,
        }),
        document.createTextNode(
          t(result.isTie ? 'landing.example.tieTail' : 'landing.example.tail')
        ),
      ]),
    ]),
    el('div', { class: 'example-margin' }, [
      el('span', { text: t('landing.example.gap') }),
      el('strong', { text: result.isTie ? '0.0' : fmt(result.margin) }),
      el('span', { text: t('landing.example.points') }),
    ]),
  ]);

  const scores = el('div', { class: 'example-scores' });
  result.sortedScores.forEach((score) => {
    const isLeader = topIds.has(score.optionId);
    scores.append(
      el('div', { class: `example-row${isLeader ? ' is-leader' : ''}` }, [
        el('span', { class: 'example-name', text: score.optionName }),
        el('div', {
          class: 'example-bar',
          attrs: {
            role: 'img',
            'aria-label': t('landing.example.aria', {
              option: score.optionName,
              score: fmt(score.score),
            }),
          },
        }, [el('span', { attrs: { style: `--fill: ${score.score}%` } })]),
        el('span', { class: 'example-score' }, [fmt(score.score), el('small', { text: '/100' })]),
      ])
    );
  });

  const weightWrap = el('div', {
    class: 'example-weights',
    attrs: { 'aria-label': t('landing.example.criteria') },
  });
  [...decision.criteria]
    .sort((a, b) => b.weight - a.weight)
    .forEach((criterion) => {
      const chip = el('span', { class: 'weight-chip' }, [
        document.createTextNode(`${criterion.name} `),
        el('strong', { text: `${criterion.weight}/5` }),
      ]);
      weightWrap.append(chip);
    });

  container.append(top, scores, weightWrap);
}

function emptyArtMarkup() {
  const suffix = Math.random().toString(36).slice(2, 7);
  const localized = EMPTY_ART.replace('FIELD NOTE / EMPTY', t('empty.fieldNote'))
    .replace('ROOM TO BEGIN', t('empty.room'))
    .replace('Option 01', t('empty.option1'))
    .replace('Option 02', t('empty.option2'))
    .replace('Option 03', t('empty.option3'))
    .replace('YOUR CLARITY', t('empty.yourClarity'))
    .replace('GOES HERE', t('empty.goesHere'))
    .replace('NOTHING SAVED YET', t('empty.nothingSaved'))
    .replace('SPACE TO THINK', t('empty.space'));
  return localized.replaceAll('emptyRay', `emptyRay-${suffix}`).replaceAll('emptyHalo', `emptyHalo-${suffix}`);
}

function makeEmptyLibrary() {
  return el('div', { class: 'empty-library' }, [
    el('div', { class: 'empty-copy' }, [
      el('p', { class: 'eyebrow' }, [
        el('span', { class: 'eyebrow-dot' }),
        t('landing.empty.eyebrow'),
      ]),
      el('h3', { text: t('landing.empty.title') }),
      el('p', { text: t('landing.empty.body') }),
      el('div', { class: 'empty-actions' }, [
        el('button', {
          class: 'btn btn-primary btn-sm',
          attrs: { type: 'button', 'data-start': '' },
        }, [t('landing.empty.start')]),
        el('button', {
          class: 'btn btn-ghost btn-sm',
          attrs: { type: 'button', 'data-sample': 'current' },
        }, [t('landing.empty.sample')]),
      ]),
    ]),
    el('div', { class: 'empty-art', attrs: { 'aria-hidden': 'true' }, html: emptyArtMarkup() }),
  ]);
}

function recentLeader(decision) {
  const result = explainResults(decision);
  if (!result.ok) return { label: t('landing.recent.needsReview'), score: null };
  return {
    label: result.isTie ? t('landing.recent.tied') : result.leader.optionName,
    score: fmt(result.leader.score),
    tie: result.isTie,
  };
}

function renderRecentDecisions() {
  const container = $('#recentDecisions');
  if (!container) return;
  container.replaceChildren();

  const result = storage.readDecisions();
  const decisions = result.decisions.slice(0, 3);

  if (result.error && !state.storageNoticeShown) {
    showToast(localizeStorageError(result.error), { tone: 'note' });
    state.storageNoticeShown = true;
  }

  if (!decisions.length) {
    container.append(makeEmptyLibrary());
    return;
  }

  decisions.forEach((decision) => {
    const leader = recentLeader(decision);
    const card = el('article', { class: 'recent-card' }, [
      el('div', { class: 'recent-card-top' }, [
        el('span', { class: 'recent-date', text: formatDate(decision.updatedAt) }),
        el('span', { class: 'recent-tag', text: t('landing.recent.local') }),
      ]),
      el('h3', { text: decision.title }),
      el('p', {
        class: 'recent-desc',
        text:
          decision.description ||
          `${plural('common.options', decision.options.length)} · ${plural(
            'common.criteria',
            decision.criteria.length
          )}`,
      }),
      el('div', { class: 'recent-leader' }, [
        el('div', {}, [
          el('span', { text: t('landing.recent.closest') }),
          el('strong', { text: leader.label }),
        ]),
        leader.score ? el('span', { class: 'recent-score', text: leader.score }) : null,
      ]),
      el('button', {
        class: 'recent-card-open',
        attrs: { type: 'button', 'data-open-decision': decision.id },
      }, [el('span', { text: t('landing.recent.open', { title: decision.title }) })]),
    ]);
    container.append(card);
  });

  container.append(
    el('div', { class: 'recent-more' }, [
      el('a', {
        class: 'text-link',
        attrs: { href: ROUTES.saved },
        text: t('landing.recent.viewAll'),
      }),
    ])
  );
}

function renderLanding() {
  updatePresetButtons();
  renderLandingExample();
  renderRecentDecisions();
  startHeroRotation({ preserveIndex: true, restart: true });
  requestAnimationFrame(observeReveals);
}

/* ============================================================
   Saved library
   ============================================================ */
function renderSavedEmpty({ searched = false } = {}) {
  if (searched) {
    return el('div', { class: 'saved-empty' }, [
      el('h2', { text: t('saved.searchEmpty.title') }),
      el('p', { text: t('saved.searchEmpty.body') }),
      el('div', { class: 'empty-actions' }, [
        el('button', {
          class: 'btn btn-outline btn-sm',
          attrs: { type: 'button', 'data-clear-search': '' },
          text: t('saved.searchEmpty.clear'),
        }),
      ]),
    ]);
  }
  return el('div', { class: 'saved-empty' }, [
    el('div', { attrs: { 'aria-hidden': 'true' }, html: emptyArtMarkup() }),
    el('h2', { text: t('saved.empty.title') }),
    el('p', { text: t('saved.empty.body') }),
    el('div', { class: 'empty-actions' }, [
      el('button', {
        class: 'btn btn-primary btn-sm',
        attrs: { type: 'button', 'data-new-decision': '' },
        text: t('saved.empty.start'),
      }),
      el('button', {
        class: 'btn btn-ghost btn-sm',
        attrs: { type: 'button', 'data-sample': 'current' },
        text: t('saved.empty.sample'),
      }),
    ]),
  ]);
}

function renderSaved() {
  const list = $('#savedList');
  const count = $('#savedCount');
  const notice = $('#savedNotice');
  const search = $('#savedSearch');
  if (!list) return;

  if (search && search.value !== state.savedQuery) search.value = state.savedQuery;

  const result = storage.readDecisions();
  const decisions = result.decisions;
  const query = state.savedQuery.trim().toLowerCase();

  if (notice) {
    if (!result.persistent) {
      notice.hidden = false;
      notice.textContent = t('saved.notice.unavailable');
    } else if (result.error) {
      notice.hidden = false;
      notice.textContent = localizeStorageError(result.error);
    } else {
      notice.hidden = true;
      notice.textContent = '';
    }
  }

  const filtered = query
    ? decisions.filter((decision) => {
        const haystack = [
          decision.title,
          decision.description,
          ...decision.options.map((option) => `${option.name} ${option.description || ''}`),
          ...decision.criteria.map((criterion) => criterion.name),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
    : decisions;

  if (count) {
    if (!decisions.length) count.textContent = t('saved.nothing');
    else if (query) {
      count.textContent = t('saved.shown', {
        shown: filtered.length,
        total: decisions.length,
      });
    } else count.textContent = plural('common.decisions', decisions.length);
  }

  list.replaceChildren();

  if (!decisions.length) {
    list.append(renderSavedEmpty());
    return;
  }
  if (!filtered.length) {
    list.append(renderSavedEmpty({ searched: true }));
    return;
  }

  filtered.forEach((decision) => {
    const leader = recentLeader(decision);
    const meta = el('div', { class: 'saved-meta' }, [
      el('span', { text: t('saved.updated', { date: formatDate(decision.updatedAt) }) }),
      el('span', { text: plural('common.options', decision.options.length) }),
      el('span', { text: plural('common.criteria', decision.criteria.length) }),
    ]);

    const leaderNode = el('div', { class: 'saved-leader' }, [
      el('span', { text: t('saved.closest') }),
      el('strong', { text: leader.label }),
      leader.score ? el('em', { text: leader.score }) : null,
    ]);

    const actions = el('div', { class: 'saved-actions' }, [
      el('button', {
        class: 'btn btn-outline btn-sm',
        attrs: { type: 'button', 'data-open-decision': decision.id },
      }, [t('saved.open')]),
      svgIconButton('copy', t('saved.duplicateAria', { title: decision.title }), 'icon-only'),
      svgIconButton('trash', t('saved.deleteAria', { title: decision.title }), 'icon-only is-danger'),
    ]);
    const actionButtons = $$('.icon-only', actions);
    actionButtons[0].setAttribute('data-duplicate-decision', decision.id);
    actionButtons[1].setAttribute('data-delete-decision', decision.id);

    list.append(
      el('article', { class: 'saved-card' }, [
        el('div', {}, [el('h3', { text: decision.title }), meta]),
        leaderNode,
        actions,
      ])
    );
  });
}

async function deleteSavedDecision(id) {
  const record = storage.getDecision(id);
  if (!record.decision) {
    showToast(localizeStorageError(record.error) || t('toast.notFound'), { tone: 'error' });
    renderSaved();
    return;
  }
  const confirmed = await askConfirm({
    title: t('saved.dialog.deleteTitle', { title: record.decision.title }),
    body: t('saved.dialog.deleteBody'),
    confirmLabel: t('saved.dialog.deleteConfirm'),
  });
  if (!confirmed) return;

  const result = storage.deleteDecision(id);
  if (!result.ok) {
    showToast(localizeStorageError(result.error) || t('toast.decisionDelete'), { tone: 'error' });
    return;
  }
  if (state.decision?.id === id) {
    state.savedCurrent = false;
    state.savedAt = null;
    updateSaveState();
  }
  renderSaved();
  showToast(t('saved.toast.deleted'));
}

function duplicateSavedDecision(id) {
  const result = storage.duplicateDecision(id, t('duplicate.copy'));
  if (!result.ok) {
    showToast(localizeStorageError(result.error) || t('toast.decisionDuplicate'), { tone: 'error' });
    return;
  }
  renderSaved();
  showToast(
    t(result.persistent ? 'saved.toast.duplicated' : 'saved.toast.copySession', {
      title: result.decision.title,
    }),
    { tone: result.persistent ? 'default' : 'note' }
  );
}

function initSavedEvents() {
  $('#savedSearch')?.addEventListener('input', (event) => {
    state.savedQuery = event.target.value;
    renderSaved();
  });

  $('#savedList')?.addEventListener('click', (event) => {
    const duplicate = event.target.closest('[data-duplicate-decision]');
    if (duplicate) {
      duplicateSavedDecision(duplicate.dataset.duplicateDecision);
      return;
    }
    const remove = event.target.closest('[data-delete-decision]');
    if (remove) deleteSavedDecision(remove.dataset.deleteDecision);
  });
}

/* ============================================================
   Global delegated actions
   ============================================================ */
function initGlobalActions() {
  document.addEventListener('click', async (event) => {
    const preset = event.target.closest('[data-preset]');
    if (preset) {
      state.examplePreset = preset.dataset.preset;
      updatePresetButtons();
      renderLandingExample();
      return;
    }

    const clearSearch = event.target.closest('[data-clear-search]');
    if (clearSearch) {
      state.savedQuery = '';
      const input = $('#savedSearch');
      if (input) {
        input.value = '';
        input.focus();
      }
      renderSaved();
      return;
    }

    const open = event.target.closest('[data-open-decision]');
    if (open) {
      event.preventDefault();
      setMenu(false);
      await openSavedDecision(open.dataset.openDecision);
      return;
    }

    const start = event.target.closest('[data-start]');
    if (start) {
      event.preventDefault();
      setMenu(false);
      startDecisionFlow();
      return;
    }

    const sample = event.target.closest('[data-sample]');
    if (sample) {
      event.preventDefault();
      setMenu(false);
      await loadSampleFlow();
      return;
    }

    const workspace = event.target.closest('[data-workspace]');
    if (workspace) {
      event.preventDefault();
      setMenu(false);
      ensureDecision();
      navigate(routeForStep(state.step));
      return;
    }

    const newDecision = event.target.closest('[data-new-decision]');
    if (newDecision) {
      event.preventDefault();
      setMenu(false);
      const reset = await resetToBlank();
      if (!reset) return;
      state.step = 'setup';
      navigate(ROUTES.setup);
      showToast(t('setup.toast.blank'), { tone: 'note' });
      return;
    }

    const scroll = event.target.closest('[data-scroll]');
    if (scroll) {
      event.preventDefault();
      setMenu(false);
      scrollToSection(scroll.dataset.scroll);
    }
  });
}

/* ============================================================
   Init
   ============================================================ */
function init() {
  initLanguage();
  initLanguageControls();
  updateFooterRights();
  renderContact();

  initTheme();
  initNavigation();
  initReveals();
  initHeroInteraction();
  initSetupEvents();
  initRatingEvents();
  initStepNavigation();
  initReportEvents();
  initSavedEvents();
  initGlobalActions();

  initHeroRotation();
  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  window.addEventListener('pagehide', () => {
    if (state.dirty && state.decision) storage.saveDraft(state.decision);
  });

  if (!storage.isAvailable() && !state.storageNoticeShown) {
    state.storageNoticeShown = true;
    window.setTimeout(() => {
      showToast(t('toast.storageUnavailable'), {
        tone: 'note',
        duration: 7000,
      });
    }, 900);
  }
}

init();

