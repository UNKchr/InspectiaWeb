const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Timestamp } = require('mongodb');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre de usuario es obligatorio"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio"],
    trim: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [8, "La contraseña debe tener al menos 8 caracteres"]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  saldo: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

//Hook para hashear la contraseña antes de guardarla.
UserSchema.pre('save', async function(next) {
  //Solo hashear la contraseña si ha sido modificada o es nueva.
  if (!this.isModified('password')) {
    return next();
  }

  //Generar el salt y hashear la contraseña.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//Metodo para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;