import multer from 'multer'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(Object.assign(new Error('Only JPG, PNG, WEBP or AVIF images allowed'), { status: 400 }))
    }
    cb(null, true)
  }
})
