const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/admin.middleware');
const { 
  getAllRequests,
  updateRequestStatus,
  addSaldoToUser,
  deleteRequest,
  searchUsers
 } = require('../controllers/admin.controller');

// Todas estas rutas están doblemente protegidas:
// 1. 'protect': El usuario debe estar logueado.
// 2. 'adminOnly': El usuario debe ser administrador.

const adminAccess = [protect, adminOnly];

// GET /api/admin/requests - Obtener todas las solicitudes
router.get('/requests', adminAccess, getAllRequests);

// PUT /api/admin/requests/:requestId/status - Actualizar estado de una solicitud
router.put('/requests/:requestId/status', adminAccess, updateRequestStatus);

// DELETE /api/admin/requests/:requestId - Eliminar una solicitud
router.delete('/requests/:requestId', adminAccess, deleteRequest);

// POST /api/admin/add-saldo-to-user - Añadir saldo a un usuario por userId o email
router.post('/add-saldo-to-user', adminAccess, addSaldoToUser);

// GET /api/admin/users/search?q= - Buscar usuarios por email (exacto o parcial) o listar 5 recientes
router.get('/users/search', adminAccess, searchUsers);

module.exports = router;