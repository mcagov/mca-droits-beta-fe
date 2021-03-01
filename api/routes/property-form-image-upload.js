import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
// import { azureUpload } from '../../services';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `./uploads`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

function fileFilter(req, file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  req.session.data.submittedFiles.push(file);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('The selected file must be a jpg, jpeg or png');
  }
}

export default function (app) {
  (() => {
    const upload = multer({
      storage: storage,
      limits: { fileSize: 5000000 },
      fileFilter: fileFilter
    }).single('image');

    app.post(
      '/report/property-form-image-upload/:prop_id',
      function (req, res) {
        upload(req, res, function (multerError) {
          const err = {
            id: 'property-image',
            href: '#property-image'
          };
          if (multerError) {
            if (multerError.code === 'LIMIT_FILE_SIZE') {
              err.text = 'The selected file must be smaller than 5MB';
            } else if (multerError) {
              err.text = multerError;
            }

            res.json({ error: err });
          } else if (req.body.image === 'undefined') {
            err.text = 'Select an image';
            res.json({ error: err });
          } else {
            /**
             * Quick test for logic to upload image to azure
             * and delete temp image when complete
             * This will be run on the check-your-answers page
             */

            // const data = fs.createReadStream(
            //   `${path.resolve(__dirname + '/../../uploads/')}/${req.file.filename}`
            // );
            // azureUpload(data, req.file.filename);

            const id = req.params.prop_id;
            req.session.data.property[id].image = req.file.filename;
            req.session.save();
            res.json(req.file.filename);
          }
        });
      }
    );
  })();

  (() => {
    const upload = multer({
      storage: storage,
      limits: { fileSize: 5000000 },
      fileFilter: fileFilter
    }).single('image');

    app.post(
      '/report/property-bulk-image-upload/:prop_id',
      function (req, res) {
        upload(req, res, function (multerError) {
          const err = {
            id: 'upload-error-text',
            href: `#upload-error-text-${req.params.prop_id}`
          };
          if (multerError) {
            if (multerError.code === 'LIMIT_FILE_SIZE') {
              err.text = 'The selected file must be smaller than 5MB';
            } else if (multerError) {
              err.text = multerError;
            }

            return res.json({ error: err });
          } else if (req.body.image === 'undefined') {
            err.text = 'Select an image';
            return res.json({ error: err });
          } else {
            const id = req.params.prop_id;
            console.log(id);
            req.session.data.property[id].image = req.file.filename;
            req.session.save();
            return res.json(req.file.filename);
          }
        });
      }
    );
  })();
}
