// middlewares/authMiddleware.js
require('dotenv').config();

const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';

const authMiddleware = (req, res, next) => {
  if (!AUTH_ENABLED) return next();

  // Verificar sesión primero (cuando se usan cookies)
  if (req.session && req.session.user) {
    return next();
  }
  
  // Si no hay sesión, verificar token en header (para clientes que usan tokens)
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      // Aquí normalmente se verificaría el token
      // Por ahora simplemente permitimos el acceso si hay un token
      return next();
    } catch (err) {
      console.error('Error al verificar token:', err);
    }
  }
  
  return res.status(401).json({ error: 'No autorizado' });
};

module.exports = authMiddleware;
