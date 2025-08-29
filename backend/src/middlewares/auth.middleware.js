const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {

      //Obtener el token del header
      token = req.headers.authorization.split(' ')[1];

      //Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //Añadir el usuario del payload del token al objeto request
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'No autorizado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }
}