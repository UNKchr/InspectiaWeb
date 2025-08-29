const { check } = require('express-validator');

exports.registerValidator = [
  check('name', 'El nombre de usuario es obligatorio').not().isEmpty(),
  check('email', 'El correo electrónico es obligatorio').not().isEmpty().isEmail(),
  check('password', 'La contraseña es obligatoria y debe tener al menos 8 caracteres').not().isEmpty().isLength({ min: 8 })
];

exports.loginValidator = [
  check('email', 'El correo electrónico es obligatorio').not().isEmpty().isEmail(),
  check('password', 'La contraseña es obligatoria').exists()
];