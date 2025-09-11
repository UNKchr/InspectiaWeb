const express = require('express');
const cors = require('cors');

require('dotenv').config();

const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const requestRoutes = require('./src/routes/request.routes');
const adminRoutes = require('./src/routes/admin.routes');

connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:4200', 'https://inspectiaweb.onrender.com', 'http://localhost:4000'], // Cambia esto al dominio de tu frontend en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

//Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes); 

// Health / debug simple
app.get('/api/health', (req,res)=>{
  res.json({ status:'ok', time: new Date().toISOString() });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
});