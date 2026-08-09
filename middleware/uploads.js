const multer = require('multer');
const path = require('path');

// En Vercel (serverless) no existe filesystem persistente.
// Usamos memoria en todos los casos — las imágenes se guardan como base64 en la DB
// o se puede integrar Vercel Blob en el futuro.
// En local también usamos memoria para mantener consistencia.

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Solo imágenes JPG, PNG, WEBP, GIF'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { upload };
