const multer = require('multer');
const sharp = require('sharp');
const upload = multer();

module.exports = function (req, res, next) {
  upload.single('image')(req, {}, function (err) {
    if (err) throw err;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${
      req.file.mimetype.split('/')[1]
    }`;

    const small = `uploads/small-${uniqueSuffix}`;
    const medium = `uploads/medium-${uniqueSuffix}`;
    const large = `uploads/large-${uniqueSuffix}`;
    req.body.sizes = {};
    sharp(req.file.buffer)
      .resize(320, 240)
      .toFile(small)
      .then((req.body.sizes.small = small));
    sharp(req.file.buffer)
      .resize(640, 480)
      .toFile(medium)
      .then((req.body.sizes.medium = medium));
    sharp(req.file.buffer)
      .resize(1024, 768)
      .toFile(large)
      .then((req.body.sizes.large = large));

    next();
  });
};
