const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
    });
    console.log('>> Conectado a la base de datos');
  } catch (error) {
    console.error('>> Error al conectar a la base de datos:', error);
    process.exit(1);
  }
};

module.exports = connectDB;