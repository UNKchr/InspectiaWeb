const CertificationRequest = require('../models/certificationRequest.model');
const User = require('../models/user.model');
const PDFDocument = require('pdfkit');

//Precios simulados para cada certificacion
const CERTIFICATION_COSTS = {
  'CALIDAD_SOFTWARE': 1000,
  'ISO_27001': 1500,
  'SEGURIDAD_APP': 2000
};

// --- Acciones Del Usuario ---

// Crear una nueva solicitud de certificacion
exports.createRequest = async (req, res) => {
  const { certificationType, ...formData } = req.body;
  const userId = req.user._id;

  const cost = CERTIFICATION_COSTS[certificationType];
  if (!cost) {
    return res.status(400).json({ message: 'Tipo de certificación inválido' });
  }

  try {
    const user = await User.findById(userId);

    //Verificar si el usuario tiene saldo suficiente
    if (user.saldo < cost) {
      return res.status(400).json({ message: 'Saldo insuficiente' });
    }

    //Restar saldo
    user.saldo -= cost;
    await user.save();

    //crear solicitud
    const newRequest = new CertificationRequest({
      ...formData,
      certificationType,
      cost,
      user: userId
    });

    await newRequest.save();

    res.status(201).json({ message: 'Solicitud creada exitosamente', newSaldo: user.saldo, request: newRequest });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

//Obtener todas las solicitudes del usuario logueado
exports.getMyRequests = async (req, res) => {
  try {
    const request = await CertificationRequest.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.addSaldo = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Monto inválido' });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { $inc: { saldo: amount } }, { new: true }).select('-password');

    res.json({ message: 'Saldo agregado exitosamente', user });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

// Generar PDF de certificación para una solicitud completada
// GET /api/requests/:requestId/certificate
exports.generateCertificatePDF = async (req, res) => {
  const { requestId } = req.params;
  try {
    const request = await CertificationRequest.findOne({ _id: requestId, user: req.user._id }).populate('user', 'name email');
    if (!request) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    if (request.status !== 'Completada') {
      return res.status(400).json({ message: 'La solicitud aún no está completada' });
    }

    // Configurar cabeceras para descarga inline
    const fileName = `certificacion_${request._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    // Colores profesionales
    const darkBlue = '#1B365D';
    const gold = '#D4AF37';
    const lightGold = '#F4E4B8';
    const darkGray = '#2C2C2C';
    const mediumGray = '#555555';
    const lightGray = '#888888';

    // Función para crear patrones decorativos
    function createDecoratitvePattern() {
      // Patrón de esquinas
      const cornerSize = 60;
      
      // Esquina superior izquierda
      doc.save()
        .strokeColor(gold)
        .lineWidth(2)
        .moveTo(40, 40)
        .lineTo(40 + cornerSize, 40)
        .moveTo(40, 40)
        .lineTo(40, 40 + cornerSize)
        .stroke();
      
      // Detalles decorativos esquina superior izquierda
      for (let i = 0; i < 3; i++) {
        doc.circle(55 + i * 8, 55, 2).fill(gold);
      }
      
      // Esquina superior derecha
      doc.strokeColor(gold)
        .moveTo(doc.page.width - 40 - cornerSize, 40)
        .lineTo(doc.page.width - 40, 40)
        .moveTo(doc.page.width - 40, 40)
        .lineTo(doc.page.width - 40, 40 + cornerSize)
        .stroke();
      
      // Esquina inferior izquierda
      doc.moveTo(40, doc.page.height - 40)
        .lineTo(40 + cornerSize, doc.page.height - 40)
        .moveTo(40, doc.page.height - 40 - cornerSize)
        .lineTo(40, doc.page.height - 40)
        .stroke();
      
      // Esquina inferior derecha
      doc.moveTo(doc.page.width - 40 - cornerSize, doc.page.height - 40)
        .lineTo(doc.page.width - 40, doc.page.height - 40)
        .moveTo(doc.page.width - 40, doc.page.height - 40 - cornerSize)
        .lineTo(doc.page.width - 40, doc.page.height - 40)
        .stroke();
      
      doc.restore();
    }

    // Crear fondo sutil con gradiente simulado
    function createBackground() {
      // Fondo principal
      doc.rect(0, 0, doc.page.width, doc.page.height)
        .fillColor('#FEFEFE')
        .fill();
      
      // Fondo decorativo central
      doc.rect(60, 120, doc.page.width - 120, doc.page.height - 240)
        .fillColor('#FDFDFD')
        .strokeColor(lightGold)
        .lineWidth(1)
        .fillAndStroke();
    }

    // Crear marca de agua sutil
    function createWatermark() {
      doc.save()
        .fillColor(lightGold, 0.1)
        .fontSize(120)
        .font('Helvetica-Bold')
        .text('CERTIFICADO', 0, doc.page.height / 2 - 60, {
          align: 'center',
          angle: -45
        });
      doc.restore();
    }

    // Aplicar elementos de fondo
    createBackground();
    createWatermark();
    createDecoratitvePattern();

    // Borde principal elegante
    doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100)
      .lineWidth(3)
      .strokeColor(darkBlue)
      .stroke();

    doc.rect(55, 55, doc.page.width - 110, doc.page.height - 110)
      .lineWidth(1)
      .strokeColor(gold)
      .stroke();

    // Header con logo simulado y título
    doc.save()
      .fillColor(darkBlue)
      .rect(70, 70, doc.page.width - 140, 80)
      .fill();

    // "Logo" simulado
    doc.save()
      .fillColor('white')
      .circle(90, 110, 15)
      .fill()
      .strokeColor(gold)
      .lineWidth(2)
      .circle(90, 110, 15)
      .stroke();
    
    // Iniciales en el logo
    doc.fillColor(darkBlue)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('IC', 85, 106);

    // Título principal
    doc.fillColor('white')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('CERTIFICATE OF COMPLIANCE', 120, 85);
    
    doc.fontSize(14)
      .font('Helvetica')
      .text('CERTIFICADO DE CONFORMIDAD', 120, 110);
    
    doc.restore();

    // Línea decorativa
    doc.moveTo(80, 170)
      .lineTo(doc.page.width - 80, 170)
      .strokeColor(gold)
      .lineWidth(2)
      .stroke();

    // Pequeños elementos decorativos
    for (let i = 0; i < 5; i++) {
      doc.circle(doc.page.width / 2 - 40 + i * 20, 175, 3)
        .fillColor(gold)
        .fill();
    }

    // Texto de presentación
    doc.moveDown(2);
    doc.fontSize(16)
      .fillColor(darkGray)
      .font('Helvetica')
      .text('This certificate is hereby granted to:', 0, 200, { align: 'center' });

    // Nombre del usuario con estilo elegante
    doc.moveDown(1);
    const nameY = 240;
    
    // Fondo para el nombre
    doc.rect(100, nameY - 10, doc.page.width - 200, 40)
      .fillColor(lightGold, 0.3)
      .fill();

    doc.fontSize(26)
      .fillColor(darkBlue)
      .font('Helvetica-Bold')
      .text(request.user.name.toUpperCase(), 0, nameY, { 
        align: 'center',
        letterSpacing: 2
      });

    // Email con estilo sutil
    doc.moveDown(0.5);
    doc.fontSize(11)
      .fillColor(mediumGray)
      .font('Helvetica-Oblique')
      .text(request.user.email, 0, nameY + 35, { align: 'center' });

    // Línea decorativa bajo el nombre
    doc.moveTo(150, nameY + 55)
      .lineTo(doc.page.width - 150, nameY + 55)
      .strokeColor(gold)
      .lineWidth(1)
      .stroke();

    // Sección de detalles con diseño en columnas
    const detailsStartY = 320;
    doc.y = detailsStartY;

    // Fondo para la sección de detalles
    doc.rect(80, detailsStartY - 10, doc.page.width - 160, 280)
      .fillColor('#FAFAFA')
      .strokeColor(lightGold)
      .lineWidth(1)
      .fillAndStroke();

    // Título de detalles
    doc.fontSize(14)
      .fillColor(darkBlue)
      .font('Helvetica-Bold')
      .text('CERTIFICATION DETAILS', 0, detailsStartY + 10, { align: 'center' });

    doc.moveDown(1);

    // Función mejorada para mostrar datos
    function createDetailRow(label, value, yPos) {
      const leftMargin = 100;
      const labelWidth = 160;
      
      // Fondo alternado para las filas
      if (Math.floor((yPos - detailsStartY - 40) / 25) % 2 === 0) {
        doc.rect(85, yPos - 3, doc.page.width - 170, 20)
          .fillColor('#F8F8F8')
          .fill();
      }

      // Label
      doc.fontSize(10)
        .fillColor(darkBlue)
        .font('Helvetica-Bold')
        .text(label + ':', leftMargin, yPos, { width: labelWidth });

      // Value
      doc.fontSize(10)
        .fillColor(darkGray)
        .font('Helvetica')
        .text(value, leftMargin + labelWidth, yPos, { width: 200 });
    }

    let currentY = detailsStartY + 40;
    const rowHeight = 25;

    createDetailRow('Tipo de Certificación', request.certificationType.replace(/_/g, ' '), currentY);
    currentY += rowHeight;
    
    createDetailRow('Nombre del Proyecto', request.projectName, currentY);
    currentY += rowHeight;
    
    createDetailRow('Descripción', request.projectDescription.substring(0, 50) + '...', currentY);
    currentY += rowHeight;
    
    createDetailRow('URL del Proyecto', request.projectUrl, currentY);
    currentY += rowHeight;
    
    createDetailRow('Repositorio', request.repoUrl, currentY);
    currentY += rowHeight;
    
    if (request.companyName) {
      createDetailRow('Empresa', request.companyName, currentY);
      currentY += rowHeight;
    }
    
    if (request.companyAddress) {
      createDetailRow('Dirección Empresa', request.companyAddress, currentY);
      currentY += rowHeight;
    }
    
    if (request.appPlatform) {
      createDetailRow('Plataforma', request.appPlatform, currentY);
      currentY += rowHeight;
    }
    
    createDetailRow('Costo de Certificación', `$${request.cost.toFixed(2)} USD`, currentY);
    currentY += rowHeight;
    
    createDetailRow('Fecha de Emisión', new Date(request.updatedAt).toLocaleDateString('es-ES'), currentY);

    // Sección de autoridad certificadora
    const authorityY = doc.page.height - 200;
    
    // Fondo para la autoridad
    doc.rect(80, authorityY - 20, doc.page.width - 160, 100)
      .fillColor(darkBlue)
      .fill();

    // Texto de la autoridad
    doc.fontSize(18)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('INSPECTIA CERTIFICATION AUTHORITY', 0, authorityY, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(10)
      .fillColor(lightGold)
      .font('Helvetica')
      .text('This document certifies that the application has met the established criteria for evaluation.', 0, authorityY + 25, { 
        align: 'center',
        width: doc.page.width - 160
      });

    // Número de certificado
    const certNumber = `CERT-${request._id.toString().substring(0, 8).toUpperCase()}`;
    doc.fontSize(9)
      .fillColor(lightGold)
      .text(`Certificate No: ${certNumber}`, 0, authorityY + 50, { align: 'center' });

    // Sello oficial simulado
    const sealY = authorityY + 70;
    
    // Círculo principal del sello
    doc.save()
      .strokeColor(gold)
      .lineWidth(3)
      .circle(150, sealY, 25)
      .stroke();
    
    // Círculo interior
    doc.strokeColor(gold)
      .lineWidth(1)
      .circle(150, sealY, 20)
      .stroke();
    
    // Texto del sello
    doc.fillColor(gold)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text('OFFICIAL', 138, sealY - 8);
    
    doc.fontSize(6)
      .text('SEAL', 145, sealY + 2);
    
    doc.restore();

    // Línea de firma
    doc.moveTo(doc.page.width - 250, sealY + 10)
      .lineTo(doc.page.width - 100, sealY + 10)
      .strokeColor(darkBlue)
      .lineWidth(1)
      .stroke();

    // Texto de firma
    doc.fontSize(10)
      .fillColor(darkBlue)
      .font('Helvetica-Bold')
      .text('Director de Certificación', doc.page.width - 250, sealY + 20, {
        width: 150,
        align: 'center'
      });

    // Fecha en la esquina - color más visible
    doc.fontSize(8)
      .fillColor('#333333')
      .text(`Emitido el: ${new Date().toLocaleDateString('es-ES')}`, 
            doc.page.width - 150, doc.page.height - 60);

    // Código QR simulado (representado como un cuadrado con patrón)
    const qrSize = 40;
    const qrX = doc.page.width - 80;
    const qrY = doc.page.height - 120;
    
    doc.rect(qrX - qrSize/2, qrY - qrSize/2, qrSize, qrSize)
      .fillColor(darkBlue)
      .fill();
    
    // Patrón interno del QR
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        if ((i + j) % 2 === 0) {
          doc.rect(qrX - qrSize/2 + i*6 + 2, qrY - qrSize/2 + j*6 + 2, 4, 4)
            .fillColor('white')
            .fill();
        }
      }
    }

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generando el PDF' });
  }
};