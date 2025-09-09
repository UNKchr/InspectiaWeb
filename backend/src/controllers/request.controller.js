const CertificationRequest = require('../models/certificationRequest.model');
const User = require('../models/user.model');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');

// Reutilizar una sola instancia de navegador para reducir consumo de RAM / cold start
let _browserPromise = null;
async function getBrowser() {
  if (_browserPromise) return _browserPromise;
  const launchOpts = {
    headless: true, // "new" a veces provoca issues en ciertos contenedores
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
      '--single-process'
    ]
  };
  if (process.env.CHROME_BIN) {
    launchOpts.executablePath = process.env.CHROME_BIN;
  }
  _browserPromise = puppeteer.launch(launchOpts).catch(err => {
    console.error('[PUPPETEER_LAUNCH_ERROR]', err);
    _browserPromise = null;
    throw err;
  });
  return _browserPromise;
}

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

// Generar PDF usando HTML/CSS (EJS + Puppeteer)
// GET /api/requests/:requestId/certificate
exports.generateCertificatePDF = async (req, res) => {
  const { requestId } = req.params;
  try {
    console.time('[CERTIFICATE_TOTAL]');
    console.log('[CERTIFICATE_REQ] user', req.user && req.user._id, 'requestId', requestId);
    const request = await CertificationRequest.findOne({ _id: requestId, user: req.user._id }).populate('user', 'name email');
    if (!request) {
      console.warn('[CERTIFICATE_NOT_FOUND]', requestId);
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }
    if (request.status !== 'Completada') {
      console.warn('[CERTIFICATE_STATUS_INVALID]', request.status);
      return res.status(400).json({ message: 'La solicitud aún no está completada' });
    }

    const templatePath = path.join(__dirname, '..', 'templates', 'certificate.ejs');
    const certNumber = `CERT-${request._id.toString().substring(0, 8).toUpperCase()}`;

    let html;
    try {
      html = await ejs.renderFile(templatePath, { ...request.toObject(), user: request.user, certNumber });
    } catch(templateErr) {
      console.error('[CERTIFICATE_TEMPLATE_ERROR]', templateErr);
      return res.status(500).json({ message: 'Error procesando plantilla' });
    }

    let pdfBuffer;
    try {
      const browser = await getBrowser();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
      });
      await page.close();
    } catch (browserErr) {
      console.error('[CERTIFICATE_PDF_BROWSER_ERROR]', browserErr);
      throw browserErr;
    }

    const fileName = `certificacion_${request._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  console.timeEnd('[CERTIFICATE_TOTAL]');
  return res.send(pdfBuffer);
  } catch (error) {
    console.error('[CERTIFICATE_PDF_ERROR]', error.message, error.stack);
    const debugInfo = process.env.NODE_ENV === 'production' ? {} : { error: error.message, stack: error.stack };
    res.status(500).json({ message: 'Error generando el PDF (HTML)', ...debugInfo });
  }
};