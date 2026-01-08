const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DOMAIN = process.env.DOMAIN || 'localhost:3000';
const BASE_PATH = process.env.BASE_PATH || ''; // e.g. /cmu-cs-445/trancongminh

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Create a router for the subpath
const router = express.Router();

// Serve static files
router.use(express.static('public'));
router.use('/uploads', express.static(uploadsDir));

// Upload endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const protocol = DOMAIN.includes('localhost') ? 'http' : 'https';
  // Final URL with domain and base path
  const fullDomainWithBase = BASE_PATH ? `${DOMAIN}${BASE_PATH}` : DOMAIN;
  const imageUrl = `${protocol}://${fullDomainWithBase}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    filename: req.file.filename,
    url: imageUrl
  });
});

// Error handling within router
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Upload error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Mount the router on the base path
app.use(BASE_PATH || '/', router);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📸 Domain: ${DOMAIN}`);
  console.log(`🔗 Base Path: ${BASE_PATH || '/'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
