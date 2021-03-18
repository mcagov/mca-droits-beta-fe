const { body, validationResult } = require('express-validator');
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { azureUpload } from '../../../services';
import { formatValidationErrors } from '../../../utilities';
const csv = require('fast-csv');

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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: fileFilter
}).single('bulk-upload-file');

function fileFilter(req, file, cb) {
  // Allowed ext
  const filetypes = /csv/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) {
    return cb(null, true);
  } else {
    cb('The selected file must be a CSV');
  }
}

export default function (app) {
  app.post(
    "/report/property-bulk",
    function (req, res) {
      upload(req, res, function (multerError) {
        const err = {
          id: 'property-bulk-file-error',
          href: '#property-bulk-file-error'
        };
        if (multerError) {
          if (multerError.code === 'LIMIT_FILE_SIZE') {
            err.text = 'The selected file must be smaller than 5MB';
          } else if (multerError) {
            err.text = multerError;
          }
          res.json({ error: err });
        } else {
          const fileRows = [];
          csv.parseFile(req.file.path, { headers: true })
            .on("data", function (data) {
              fileRows.push(data); // push each row
            })
            .on("end", function () {
              fs.unlinkSync(req.file.path);   // remove temp file

              // 'fileRows' is an array of objects. Each object represents a row in the csv file, with each obj element a column
              // Process "fileRows" and respond  
              let fileUpload = fileRows;

              req.session.data['bulk-upload'] = {};
              const sessionBulkUpload = req.session.data['bulk-upload'];

              fileUpload.forEach((obj, index) => {
                // Create a bulk upload ID for each item
                let itemID = 'bu' + index;
                // Build up the session data object for each item
                sessionBulkUpload[itemID] = {};
                const item = sessionBulkUpload[itemID];
                item['description'] = obj['Description'];
                item['quantity'] = obj['Quantity'];
                item['value'] = obj['Total value'];
                if (obj['Total value']) {
                  item['value-known'] = 'yes';
                };

                if (obj['Storage address line 1'] && obj['Postcode']) {
                  item['storage-address'] = 'custom';
                  item['address-details'] = {};
                  item['address-details']['address-line-1'] = obj['Storage address line 1'];
                  item['address-details']['address-line-2'] = obj['Storage address line 2'];
                  item['address-details']['address-town'] = obj['Town'];
                  item['address-details']['address-county'] = obj['County'];
                  item['address-details']['address-postcode'] = obj['Postcode'];
                } else {
                  item['storage-address'] = 'personal';
                }

              });

              for (const prop in sessionBulkUpload) {
                req.session.data['property'][prop] = sessionBulkUpload[prop];
              }

              res.json({ status: 200 });
            })
        }
      })
    }
  );
}


