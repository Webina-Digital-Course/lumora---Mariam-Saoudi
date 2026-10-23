import test from 'node:test';
import assert from 'node:assert/strict';

import { formatDate, formatList, t, tn, translationKeys } from '../js/i18n.js';
import { CONTACT, buildContactLinks, buildWhatsAppUrl } from '../js/site-config.js';

test('English and Arabic dictionaries contain the same keys', () => {
  const english = new Set(translationKeys('en'));
  const arabic = new Set(translationKeys('ar'));
  const missingArabic = [...english].filter((key) => !arabic.has(key));
  const missingEnglish = [...arabic].filter(
    (key) => !english.has(key) && !/\.(zero|two|few|many)$/.test(key)
  );
  assert.deepEqual(missingArabic, []);
  assert.deepEqual(missingEnglish, []);
});

test('translation interpolates supplied values and falls back safely', () => {
  assert.equal(t('save.save', {}, 'en'), 'Save decision');
  assert.equal(t('save.save', {}, 'ar'), 'احفظ القرار');
  assert.equal(t('contact.whatsapp', {}, 'en'), 'WhatsApp');
  assert.equal(t('contact.whatsapp', {}, 'ar'), 'واتساب');
  assert.equal(t('report.table.weight', { weight: 4 }, 'en'), 'Weight 4 / 5');
  assert.equal(t('missing.key', {}, 'en'), 'missing.key');
});

test('plural selection follows the active language', () => {
  assert.equal(tn('common.options', 1, {}, 'en'), '1 option');
  assert.equal(tn('common.options', 3, {}, 'en'), '3 options');
  assert.equal(tn('common.options', 2, {}, 'ar'), 'خياران');
  assert.equal(tn('common.options', 5, {}, 'ar'), '5 خيارات');
});

test('date and list formatting follow the requested language', () => {
  assert.equal(formatList(['أ', 'ب'], 'ar'), 'أ وب');
  assert.match(formatDate('2026-10-23', 'ar'), /2026/);
  assert.equal(formatList(['A', 'B'], 'en'), 'A and B');
});

test('direct contact links omit unconfigured values', () => {
  assert.deepEqual(buildContactLinks({ email: '', instagram: '' }), []);
  assert.deepEqual(buildContactLinks({ email: 'not-an-email', instagram: 'ftp://x' }), []);
  assert.deepEqual(buildContactLinks({ email: '', instagram: 'https://example.com/lumora' }), []);
  assert.deepEqual(buildContactLinks({ email: '', instagram: 'https://instagram.com/' }), []);
});

test('direct contact links build safe destinations without a phone option', () => {
  const links = buildContactLinks({
    email: 'owner@example.com',
    instagram: 'https://instagram.com/lumora',
  });
  assert.deepEqual(
    links.map((link) => link.id),
    ['email', 'instagram']
  );
  assert.equal(links[0].href, 'mailto:owner@example.com');
  assert.equal(links[1].href, 'https://instagram.com/lumora');
  assert.equal(links[1].value, '@lumora');
  assert.equal(links[1].external, true);
  assert.ok(links.every((link) => !link.href.startsWith('tel:')));
});

test('configured contact details build the exact live destinations', () => {
  const links = buildContactLinks();
  assert.deepEqual(
    links.map((link) => link.id),
    ['email', 'instagram']
  );
  assert.equal(CONTACT.phone, undefined);
  assert.equal(links[0].value, 'saoudimariam11@gmail.com');
  assert.equal(links[0].href, 'mailto:saoudimariam11@gmail.com');
  assert.equal(links[1].value, '@nyx.hellenic');
  assert.equal(links[1].href, 'https://www.instagram.com/nyx.hellenic/');
  assert.equal(links[1].external, true);
});

test('the four WhatsApp suggestions contain distinct encoded messages', () => {
  const messages = [
    "Hi Mariam! I'd love to get in touch with you.",
    'Hi Mariam! I have a question about Lumora.',
    "Hi Mariam! I have an idea I'd love to share with you about Lumora.",
    "Hi Mariam! I'd like to share some feedback about Lumora.",
  ];
  const urls = messages.map((message) => buildWhatsAppUrl(message));

  assert.deepEqual(
    urls,
    messages.map((message) => `https://wa.me/212656956847?text=${encodeURIComponent(message)}`)
  );
  assert.equal(new Set(urls).size, messages.length);
});

test('the four WhatsApp suggestion messages are translated into Arabic', () => {
  const keys = [
    'contact.suggestion.hello.message',
    'contact.suggestion.question.message',
    'contact.suggestion.idea.message',
    'contact.suggestion.feedback.message',
  ];
  const english = keys.map((key) => t(key, {}, 'en'));
  const arabic = keys.map((key) => t(key, {}, 'ar'));

  assert.equal(new Set(arabic).size, keys.length);
  arabic.forEach((message, index) => {
    assert.notEqual(message, english[index]);
    assert.match(
      buildWhatsAppUrl(message),
      /^https:\/\/wa\.me\/212656956847\?text=[^?&]+$/u
    );
  });
});
