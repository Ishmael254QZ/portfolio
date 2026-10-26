export function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    return res.status(401).json({ error: 'Sign in with an administrator account to continue.' });
  }
  next();
}

export function requireSameOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin) {
    return res.status(403).json({ error: 'A same-origin request is required.' });
  }

  try {
    if (new URL(origin).host !== req.get('host')) {
      return res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
    }
  } catch {
    return res.status(403).json({ error: 'The request origin is invalid.' });
  }

  next();
}
