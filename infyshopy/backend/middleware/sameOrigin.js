/**
 * Same-Origin Security Middleware for Infyshopy
 * Replicates the live security gate discovered in reverse engineering
 */
function sameOriginCheck(req, res, next) {
  // Allow safe GET requests or requests with valid origin/referer
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const origin = req.headers['origin'];
  const referer = req.headers['referer'];
  const host = req.headers['host'];

  // Check if Origin or Referer matches local host or infyshopy.in
  const isValidOrigin = (urlStr) => {
    if (!urlStr) return false;
    try {
      const parsed = new URL(urlStr);
      return (
        parsed.host === host ||
        parsed.hostname === 'localhost' ||
        parsed.hostname === '127.0.0.1' ||
        parsed.hostname === 'infyshopy.in' ||
        parsed.hostname.endsWith('.infyshopy.in')
      );
    } catch {
      return false;
    }
  };

  if (!isValidOrigin(origin) && !isValidOrigin(referer)) {
    return res.status(403).json({ error: 'Same-origin JSON request required' });
  }

  next();
}

module.exports = sameOriginCheck;

