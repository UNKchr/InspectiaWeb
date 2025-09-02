const User = require('../models/user.model');

const getUserProfile = async (req, res) => {
  try {
    // El middleware 'protect' ya ha puesto la información del usuario en req.user
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};

module.exports = {
  getUserProfile,
};
