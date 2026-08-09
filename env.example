// Verifica que el usuario tenga sesión activa
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  // Si es petición AJAX, responder con JSON
  if (req.headers['x-requested-with'] === 'XMLHttpRequest' || req.path.startsWith('/api/admin')) {
    return res.status(401).json({ error: 'No autorizado. Iniciá sesión.' });
  }
  // Si es petición de página, redirigir
  return res.redirect('/login.html');
}

// Adjunta datos del usuario a res.locals para las vistas
function attachUser(req, res, next) {
  res.locals.user = req.session?.user || null;
  next();
}

module.exports = { requireAuth, attachUser };
