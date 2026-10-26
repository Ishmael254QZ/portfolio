import multer from 'multer';

const allowedImageTypes = [
  { mime: 'image/jpeg', extension: 'jpg' },
  { mime: 'image/png', extension: 'png' },
  { mime: 'image/webp', extension: 'webp' }
];

function identifyImage(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return allowedImageTypes[0];
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return allowedImageTypes[1];
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return allowedImageTypes[2];
  }
  return null;
}

const receiveImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedImageTypes.some((type) => type.mime === file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, and WebP images are accepted.'));
    }
    callback(null, true);
  }
}).single('image');

export function uploadImage(req, res, next) {
  receiveImage(req, res, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Image files must be 5 MB or smaller.'
        : error.message;
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Choose an image to upload.' });
    }

    const type = identifyImage(req.file.buffer);
    if (!type || type.mime !== req.file.mimetype) {
      return res.status(400).json({ error: 'The image contents do not match a supported image format.' });
    }

    req.imageExtension = type.extension;
    next();
  });
}
