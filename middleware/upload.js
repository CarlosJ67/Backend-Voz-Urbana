const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // Agregar esta línea

// Crear directorio uploads si no existe
const uploadDir = 'uploads/reports';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'report-' + uniqueSuffix + extension);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter
});

// Middleware para optimizar imágenes después de la subida
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const { path: filePath } = req.file;
    const optimizedPath = filePath.replace(/\.[^/.]+$/, '_optimized.jpg');

    // Optimizar imagen: redimensionar y comprimir
    await sharp(filePath)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80,
        progressive: true 
      })
      .toFile(optimizedPath);


    // Reemplazar archivo original directamente
    fs.renameSync(optimizedPath, filePath);

    console.log('✅ Imagen optimizada:', filePath);
    next();
  } catch (error) {
    console.error('❌ Error optimizando imagen:', error);
    next(); // Continuar aunque falle la optimización
  }
};

module.exports = { upload, optimizeImage };