const PIN_HASH_KEY = 'pool-league-pin-hash';
const LOCKED_KEY = 'pool-league-locked';

async function hashPin(pin) {
  const msg = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest('SHA-256', msg);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function getLocked() {
  try {
    return localStorage.getItem(LOCKED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setLocked(locked) {
  try {
    if (locked) localStorage.setItem(LOCKED_KEY, '1');
    else localStorage.removeItem(LOCKED_KEY);
  } catch {}
}

export function hasPin() {
  try {
    return !!localStorage.getItem(PIN_HASH_KEY);
  } catch {
    return false;
  }
}

export async function setPin(pin) {
  const h = await hashPin(pin);
  try {
    localStorage.setItem(PIN_HASH_KEY, h);
    setLocked(false);
  } catch {}
}

export async function checkPin(pin) {
  const stored = localStorage.getItem(PIN_HASH_KEY);
  if (!stored) return false;
  const h = await hashPin(pin);
  return h === stored;
}
