const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config/env');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const EXTENSIONES_IMAGEN = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const EXTENSIONES_VIDEO = ['.mp4', '.webm', '.ogg', '.mov'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 40);
    const nombre = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${base || 'archivo'}${ext}`;
    cb(null, nombre);
  },
});

/** Acepta imágenes y videos según el límite configurado. */
const subirArchivo = multer({
  storage,
  limits: {
    fileSize: Math.max(config.uploads.maxImageSize, config.uploads.maxVideoSize),
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const esImagen = file.mimetype.startsWith('image/') && EXTENSIONES_IMAGEN.includes(ext);
    const esVideo = file.mimetype.startsWith('video/') && EXTENSIONES_VIDEO.includes(ext);
    if (!esImagen && !esVideo) {
      return cb(new Error('Formato no permitido. Sube una imagen (jpg, png, webp, gif) o un video (mp4, webm, ogg, mov).'));
    }
    const limite = esImagen ? config.uploads.maxImageSize : config.uploads.maxVideoSize;
    if (file.size > limite) {
      return cb(new Error(`El archivo excede el tamaño máximo permitido (${Math.round(limite / 1024 / 1024)} MB).`));
    }
    cb(null, true);
  },
});

/** Normaliza la ruta del archivo subido a una URL servible. */
function urlDeArchivo(req) {
  if (!req.file) return '';
  return `/uploads/${req.file.filename}`;
}

/** Elimina un archivo subido a partir de su URL (/uploads/xxx). */
function eliminarArchivo(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  const ruta = path.join(UPLOADS_DIR, path.basename(url));
  fs.unlink(ruta, () => {});
}

module.exports = { subirArchivo, urlDeArchivo, eliminarArchivo, UPLOADS_DIR };
