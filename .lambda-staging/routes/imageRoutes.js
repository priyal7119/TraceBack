const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageController = require('../controllers/imageController');
const { authenticate } = require('../middleware/authMiddleware');

// Local storage configuration for dev mode
const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const uploadDir = isLambda 
  ? path.resolve('/tmp', 'uploads')
  : path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    // In read-only filesystems or Lambda, ignore directory creation failure
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).substr(2, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Presigned upload URL generation (or dev fallback)
router.post('/upload-url', authenticate, imageController.getUploadUrl);

// Presigned GET URL generation for viewing private S3 images
router.get('/view-url', authenticate, imageController.getViewUrl);

// Local file upload endpoint (used in dev mode when AWS is not configured)
router.post('/local-upload', authenticate, upload.single('image'), imageController.handleLocalUpload);

// Rekognition scan simulation
router.post('/analyze', authenticate, imageController.analyzeImage);

module.exports = router;
