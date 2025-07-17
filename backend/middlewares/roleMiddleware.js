module.exports = (rolesPermitidos) => (req, res, next) => {
  const user = req.session.user;
  if (!user || !rolesPermitidos.includes(user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};
