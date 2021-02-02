const { body, validationResult } = require('express-validator');
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { imageUpload } from '../../services';
import { formatValidationErrors } from '../../utils';
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});
var upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: fileFilter
});

function fileFilter(req, file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

export default function (app) {
  app.post(
    '/report/property-form-image-upload/:prop_id',
    upload.single('image'),
    function (req, res) {
      const id = req.params.prop_id;
      // imageUpload(req.files.image);
      console.log(req.session.data, req.file.filename);
      req.session.data.test = 'test';
    }
  );
}
