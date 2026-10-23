
export const CONTACT = {
  email: 'saoudimariam11@gmail.com',
  instagram: 'https://www.instagram.com/nyx.hellenic/',
  whatsapp: '+212 656-956847',
};

const HTTP_URL = /^https?:\/\/[^\s]+$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function whatsappNumber(value) {
  const digits = text(value).replace(/\D/g, '');
  return digits.length >= 7 ? digits : '';
}

function instagramProfile(value) {
  const candidate = text(value);
  if (!HTTP_URL.test(candidate)) return null;
  try {
    const url = new URL(candidate);
    const host = url.hostname.replace(/^www\./i, '').toLowerCase();
    if (host !== 'instagram.com') return null;
    const path = url.pathname.replace(/\/+$/, '');
    if (!path || path === '/') return null;
    return {
      href: url.href,
      value: path.replace(/^\//, '@'),
    };
  } catch {
    return null;
  }
}

export function buildWhatsAppUrl(message, config = CONTACT) {
  const number = whatsappNumber(config.whatsapp);
  if (!number || typeof message !== 'string' || !message.trim()) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildContactLinks(config = CONTACT) {
  const email = text(config.email);
  const instagram = instagramProfile(config.instagram);
  const links = [];

  if (email && EMAIL.test(email)) {
    links.push({
      id: 'email',
      labelKey: 'contact.email',
      actionKey: 'contact.write',
      href: `mailto:${email}`,
      value: email,
    });
  }

  if (instagram) {
    links.push({
      id: 'instagram',
      labelKey: 'contact.instagram',
      actionKey: 'contact.open',
      href: instagram.href,
      value: instagram.value,
      external: true,
    });
  }

  return links;
}
