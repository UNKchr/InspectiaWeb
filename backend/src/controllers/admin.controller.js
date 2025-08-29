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
  const { userId, amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Monto inválido' });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { $inc: { saldo: amount } }, { new: true }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Saldo actualizado exitosamente', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

