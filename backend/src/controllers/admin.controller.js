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

// Buscar solicitudes de certificación por projectName con filtros opcionales (tipo y fecha)
// GET /api/admin/requests/search
// Query params:
// - q: texto a buscar en projectName (parcial, case-insensitive)
// - type: tipo de certificación (CALIDAD_SOFTWARE | ISO_27001 | SEGURIDAD_APP)
// - from: fecha inicio (ISO string o YYYY-MM-DD) para createdAt
// - to: fecha fin (ISO string o YYYY-MM-DD) para createdAt
// - limit: cantidad de elementos a retornar (1..10). Si no se envía, por defecto 5.
// Comportamiento:
// - Sin q/type/fecha: lista por defecto con prioridad de estado (Completada, Rechazada, En proceso)
//   y respeta el límite indicado (1..10; default 5).
exports.searchCertificationRequests = async (req, res) => {
  try {
    const { q, type, from, to, limit } = req.query;

    // Límite 1..10 (por defecto 5)
    let limitNum = parseInt(limit, 10);
    if (!Number.isFinite(limitNum)) limitNum = 5;
    if (limitNum < 1 || limitNum > 10) {
      return res.status(400).json({ message: 'El límite debe estar entre 1 y 10' });
    }

    const hasQuery = Boolean(q && q.trim());
    const hasType = Boolean(type);
    const hasDate = Boolean(from || to);

    // Validar tipo si viene
    const allowedTypes = ['CALIDAD_SOFTWARE', 'ISO_27001', 'SEGURIDAD_APP'];
    if (hasType && !allowedTypes.includes(type)) {
      return res.status(400).json({ message: 'Tipo de certificación inválido' });
    }

    // Parsear fecha: si viene como ISO con 'T', usar ese instante exacto;
    // si viene como 'YYYY-MM-DD' o 'DD/MM/YYYY', crear límites del día en LOCAL.
    const parseDateEndpoint = (input, kind /* 'start' | 'end' */) => {
      if (!input || typeof input !== 'string') return null;
      if (input.includes('T')) {
        const dt = new Date(input);
        return isNaN(dt.getTime()) ? null : dt;
      }
      // Soportar 'YYYY-MM-DD' del input type=date y 'DD/MM/YYYY'
      let y, m, d;
      const isoMatch = input.match(/^\d{4}-\d{2}-\d{2}$/);
      const dmyMatch = input.match(/^\d{2}\/\d{2}\/\d{4}$/);
      if (isoMatch) {
        const [yy, mm, dd] = input.split('-').map(Number);
        y = yy; m = mm; d = dd;
      } else if (dmyMatch) {
        const [dd, mm, yy] = input.split('/').map(Number);
        y = yy; m = mm; d = dd;
      } else {
        const dt = new Date(input);
        if (isNaN(dt.getTime())) return null;
        y = dt.getFullYear(); m = dt.getMonth() + 1; d = dt.getDate();
      }
      return kind === 'start'
        ? new Date(y, (m - 1), d, 0, 0, 0, 0)
        : new Date(y, (m - 1), d, 23, 59, 59, 999);
    };

    // Validar/armar filtro de fechas usando límites del día en horario local
    let dateFilter = undefined;
    if (from || to) {
      dateFilter = {};
      if (from) {
        const fromDt = parseDateEndpoint(from, 'start');
        if (!fromDt) {
          return res.status(400).json({ message: 'Fecha "from" inválida' });
        }
        dateFilter.$gte = fromDt; // inicio del día local o instante ISO
      }
      if (to) {
        const toDt = parseDateEndpoint(to, 'end');
        if (!toDt) {
          return res.status(400).json({ message: 'Fecha "to" inválida' });
        }
        dateFilter.$lte = toDt; // fin del día local o instante ISO (inclusivo)
      }
    }

    // Sin filtros ni query: listado por defecto con prioridad de estado
    if (!hasQuery && !hasType && !hasDate) {
      const pipeline = [
        {
          $addFields: {
            statusPriority: {
              $switch: {
                branches: [
                  { case: { $eq: ['$status', 'Completada'] }, then: 0 },
                  { case: { $eq: ['$status', 'Rechazada'] }, then: 1 },
                  { case: { $eq: ['$status', 'En proceso'] }, then: 2 }
                ],
                default: 3
              }
            }
          }
        },
        { $sort: { statusPriority: 1, createdAt: -1 } },
        { $limit: limitNum },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            user: { _id: '$user._id', name: '$user.name', email: '$user.email' },
            certificationType: 1,
            status: 1,
            projectName: 1,
            projectDescription: 1,
            projectUrl: 1,
            repoUrl: 1,
            companyName: 1,
            companyAddress: 1,
            appPlatform: 1,
            cost: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ];

      const results = await CertificationRequest.aggregate(pipeline);
      return res.json({ results, limit: limitNum });
    }

    // Con query/filtros: búsqueda por projectName + filtros de tipo/fecha
    const filters = {};
    if (hasQuery) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filters.projectName = { $regex: escaped, $options: 'i' };
    }
    if (hasType) {
      filters.certificationType = type;
    }
    if (dateFilter) {
      filters.createdAt = dateFilter;
    }

  const results = await CertificationRequest.find(filters)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .populate('user', 'name email');

    return res.json({ results, count: results.length, limit: limitNum });
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

