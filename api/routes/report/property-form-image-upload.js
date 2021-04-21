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
            const imageProps = {
              uploadedFilename: req.file.filename,
              originalFilename: req.file.originalname,
            };

            req.session.data.property[id].image = req.file.filename;
            req.session.data.property[id].originalFilename = req.file.originalname;
            req.session.save();
            res.json(imageProps);
          }
        });
      }
    );
  })();

  (() => {
    let imageUploads = [];

    const upload = multer({
      storage: storage,
      limits: { fileSize: 5000000 },
      fileFilter: fileFilter
    }).single('image');

    app.post(
      '/report/property-bulk-image-upload/:prop_id',
      function (req, res) {
        upload(req, res, function (multerError) {
          // Total number of wreck items 
          const itemQuantity = req.body.itemQuantity;
          // Create error summary list item, linking to the related wreck item input
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
            const itemId = req.params.prop_id;
            // For each upload, push the image filename to the imageUploads array
            imageUploads.push(
              {
                id: itemId,
                image: req.file.filename,
                originalFilename: req.file.originalname
              }
            );
            // Images will upload at different speeds, so here we make sure the image 
            // key in the wreck item object is stored correctly in session data
            for (const obj of imageUploads) {
              req.session.data.property[obj.id].image = obj.image;
              req.session.data.property[obj.id].originalFilename = obj.originalFilename;
            }
            // When all images are assigned to the relevant wreck item, clear the array
            if (itemQuantity === imageUploads.length) {
              imageUploads = [];
            }

            // Create data object to return the original filename and uuid filename
            // (which are used for the alt and src attributes on each image).
            const currentImageProps = {
              uploadedFilename: req.file.filename,
              originalFilename: req.file.originalname,
            };

            return res.json(currentImageProps);
          }
        });
      }
    );
  })();
}
