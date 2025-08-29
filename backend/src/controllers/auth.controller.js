const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

//Funcion para generar JWT.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

exports.register = async (req, res) => {
  //Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    //Verificar si el nuevo usuario ya existe.
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "El correo electrónico/usuario ya está en uso" });
    }

    //Crear un nuevo usuario (La contraseña se hashea en el pre-save hook)
    user = new User({ name, email, password });
    await user.save();

    //Generar un token JWT
    const token = generateToken(user._id);
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
};

exports.login = async (req, res) => {
  //Validar los datos de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {

    //Buscar usuario por Email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    //Comparar contraseñas
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    //Generar token y responder
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
}