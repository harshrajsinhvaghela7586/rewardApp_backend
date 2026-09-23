const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ============================================================
// ADMIN POLICY PDF STORAGE
// ============================================================

const policyStorage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: `rewardapp/policies/${req.params.userId || 'general'}`,

    // PDF ko RAW resource ke roop me store karo
    resource_type: 'raw',

    // Original PDF format preserve karo
    format: 'pdf',

    public_id: `policy_${req.params.userId}_${Date.now()}`,
  }),
});

// ============================================================
// USER DOCUMENT STORAGE
// ============================================================

const documentStorage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: `rewardapp/documents/${req.user.id}`,

    resource_type: 'auto',

    public_id: `${file.fieldname}_${req.user.id}_${Date.now()}`,
  }),
});

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only PDF, Word, JPG, PNG and WEBP files are allowed'
      ),
      false
    );
  }
};

// ============================================================
// ADMIN POLICY UPLOAD
// ============================================================

const uploadPolicy = multer({
  storage: policyStorage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
}).single('policy');

// ============================================================
// USER DOCUMENT UPLOAD
// ============================================================

const uploadDocuments = multer({
  storage: documentStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
}).fields([
  { name: 'rc', maxCount: 1 },
  { name: 'policy', maxCount: 1 },
   {
    name: 'aadhaarFront',
    maxCount: 1,
  },
  {
    name: 'aadhaarBack',
    maxCount: 1,
  },
  { name: 'pan', maxCount: 1 },
]);

// ============================================================
// MULTER ERROR HANDLER
// ============================================================

const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next();
  });
};

module.exports = {
  uploadPolicy: handleUpload(uploadPolicy),
  uploadDocuments: handleUpload(uploadDocuments),
};