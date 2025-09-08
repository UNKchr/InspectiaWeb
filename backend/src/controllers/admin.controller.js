const CertificationRequest = require('../models/certificationRequest.model');
const User = require('../models/user.model');

// --- Acciones del Administrador ---

//Obtener todas las solicitudes de todos los usuarios (Solo Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const request = await CertificationRequest.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

//Cambiar el estado de una solicitud
exports.updateRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  if (!['En proceso', 'Rechazada', 'Completada'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  try {
    const request = await CertificationRequest.findByIdAndUpdate(requestId, { status }, { new: true }).populate('user', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.json({ message: 'Estado actualizado exitosamente', request });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

  //Eliminar una solicitud
exports.deleteRequest = async (req, res) => {
    const { requestId } = req.params;

    try {
      const request = await CertificationRequest.findByIdAndDelete(requestId);
      if (!request) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
      res.json({ message: 'Solicitud eliminada exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error del servidor' });
    }
};

//Inyectar saldo a un usuario en especifico
exports.addSaldoToUser = async (req, res) => {
  const { userId, email, amount } = req.body;

  // Validación del monto
  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ message: 'Monto inválido' });
  }

  // Debe recibirse al menos userId o email
  if (!userId && !email) {
    return res.status(400).json({ message: 'Debe proporcionar userId o email para identificar al usuario' });
  }

  // Evitar que se envíen ambos para reducir ambigüedad (opcional)
  if (userId && email) {
    return res.status(400).json({ message: 'Proporcione solo userId o email, no ambos' });
  }

  try {
    let queryResult;
    if (userId) {
      queryResult = await User.findByIdAndUpdate(userId, { $inc: { saldo: parsedAmount } }, { new: true }).select('-password');
    } else if (email) {
      queryResult = await User.findOneAndUpdate({ email: email.toLowerCase() }, { $inc: { saldo: parsedAmount } }, { new: true }).select('-password');
    }

    if (!queryResult) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Saldo actualizado exitosamente', user: queryResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Buscar usuarios para asistencia del administrador (por email, nombre o id)
// GET /api/admin/users/search?q=criterio
// - Sin q: retorna hasta 5 usuarios recientes
// - Con q: busca coincidencias parciales en name / email y exacta en _id si aplica
exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    if (!q || !q.trim()) {
      const users = await User.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .select('name email saldo role createdAt');
      return res.json({ results: users });
    }

    const termRaw = q.trim();
    const termLower = termRaw.toLowerCase();
    const safeRegex = new RegExp(termRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const filters = [
      { email: safeRegex },
      { name: safeRegex }
    ];

    // Si parece un ObjectId, agregar filtro por _id exacto
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(termRaw);
    if (isObjectId) filters.push({ _id: termRaw });

    // Exact matches prioritarios (email o nombre exacto)
    const exactMatches = await User.find({ $or: [ { email: termLower }, { name: termRaw } ] })
      .select('name email saldo role createdAt');

    // Parciales (limit 10)
    const partials = await User.find({ $or: filters })
      .limit(10)
      .select('name email saldo role createdAt');

    // Merge sin duplicados
    const map = new Map();
    exactMatches.forEach(u => map.set(String(u._id), u));
    partials.forEach(u => map.set(String(u._id), u));

    res.json({ results: Array.from(map.values()) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

