const crypto = require('crypto');

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.JWT_SECRET ||
  'infyshopy-stateless-session-secret-v1';

const revokedTokens = new Set();

function toBase64Url(input) {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function fromBase64Url(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function sign(encodedPayload) {
  return crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');
}

function createSignedToken(user, ttlMs = 7 * 24 * 60 * 60 * 1000) {
  const payload = {
    uid: user.id,
    email: user.email,
    fullName: user.full_name ?? user.fullName ?? '',
    role: user.role || 'owner',
    sellerCode: user.seller_code ?? user.sellerCode ?? '',
    balance: user.balance_credits ?? user.balance ?? 20,
    exp: Date.now() + ttlMs,
    jti: crypto.randomBytes(12).toString('hex')
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

function verifySignedToken(token) {
  if (!token || typeof token !== 'string' || revokedTokens.has(token)) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, providedSig] = parts;
  if (!encoded || !providedSig) return null;

  const expectedSig = sign(encoded);
  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encoded));
    if (!payload || !payload.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function revokeToken(token) {
  if (token) {
    revokedTokens.add(token);
  }
}

module.exports = {
  createSignedToken,
  verifySignedToken,
  revokeToken
};
