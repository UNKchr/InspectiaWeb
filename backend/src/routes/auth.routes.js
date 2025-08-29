const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

//Ruta para registrar un nuevo usuario
router.post('/register', registerValidator, register);

//Ruta para iniciar sesión
router.post('/login', loginValidator, login);

module.exports = router;