//Este middleware verifica si el usuario es un administrador y se ejecuta después del middleware 'protect'.

exports.adminOnly = (req, res, next) => {
  //El middleware verifica si el usuario es un administrador.
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
}