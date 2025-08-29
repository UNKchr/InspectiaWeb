const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware'); 
const { createRequest, getMyRequests, addSaldo } = require('../controllers/request.controller');

//Todas las rutas requieren que el usuario este autenticado

// POST /api/requests - Crear una nueva solicitud
router.post('/', protect, createRequest);

// GET /api/requests/my-requests - Obtener mis solicitudes
router.get('/my-requests', protect, getMyRequests);

// POST /api/requests/add-saldo - Inyectar saldo a un usuario
router.post('/add-saldo', protect, addSaldo);

module.exports = router;
