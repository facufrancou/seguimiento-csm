// middlewares/authMiddleware.js
require('dotenv').config();

const AUTH_ENABLED = process.env.AUTH_ENABLED === 'true';

const authMiddleware = (req, res, next) => {
  if (!AUTH_ENABLED) return next();

  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({ error: 'No autorizado' });
  }
};

module.exports = authMiddleware;
