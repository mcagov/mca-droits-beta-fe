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

const err = {
  id: 'property-bulk-file-error',
  href: '#property-bulk-file-error'
};

export default function (app) {
  app.post(
    "/report/property-bulk",
    function (req, res) {
      upload(req, res, function (multerError) {
        if (multerError) {
          if (multerError.code === 'LIMIT_FILE_SIZE') {
            err.text = 'The selected file must be smaller than 5MB';
          } else if (multerError) {
            err.text = multerError;
          }
          res.json({ error: err });
        } else {
          const fileRows = [];
          csv.parseFile(req.file.path, {
            headers: true
          })
            .on('error', (errorMsg) => {
              console.log(errorMsg);
            })
            .on("data", function (data) {
              // Push each row
              fileRows.push(data);
            })
            .on("end", function () {
              // Remove temp file
              fs.unlinkSync(req.file.path);
              // Run validation checks
              validateCsvData(fileRows).then(() => {
                if (err.text) {
                  return res.json({ error: err });
                }
                // 'fileRows' is an array of objects. Each object represents a row in the csv file, with each obj element a column
                // Process "fileRows" and respond  
                let fileUpload = fileRows;

                req.session.data['bulk-upload'] = {};
                const sessionBulkUpload = req.session.data['bulk-upload'];

                fileUpload.forEach((obj, index) => {
                  // Create a bulk upload ID for each item

                  let itemID = `bu-${uuidv4()}-${index}`;
                  // Build up the session data object for each item
                  sessionBulkUpload[itemID] = {};
                  const item = sessionBulkUpload[itemID];
                  item['description'] = obj['Description'];
                  item['quantity'] = obj['Quantity'];

                  // Remove any non-numeric characters from the 'Total value' of the wreck item
                  item['value'] = obj['Total value'].replace(/\D/g, '');
                  /*if (obj['Total value'] === '') {
                    item['value'] = 'Unknown';
                  }*/
                  if (obj['Total value']) {
                    item['value-known'] = 'yes';
                  } else {
                    item['value-known'] = 'no';
                  };

                  if (obj['Storage address line 1'] && obj['Postcode']) {
                    item['storage-address'] = 'custom';
                    item['address-details'] = {};
                    item['address-details']['address-line-1'] = obj['Storage address line 1'];
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
              });
            })
        }
      })
    }
  );

  const validateCsvData = (rows) =>
    new Promise((resolve, reject) => {
      if (err.text) {
        err.text = null;
      }
      for (let i = 0; i < rows.length; i++) {
        const currentRow = rows[i];
        const postcodeRegex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;
        for (const col in currentRow) {
          // 'Total value' is not a mandatory form field so we can ignore it
          if (col !== 'Total value' & currentRow[col] === '') {
            err.text = "The selected file contains some empty values. Please check that you have entered all of the required information for each item of wreck material.";
            resolve();
          }
          else if (col === 'Postcode' && currentRow[col].match(postcodeRegex) === null) {
            err.text = "The selected file contains invalid postcode values. Please enter postcodes in the correct format, for example E1 6AN";
            resolve();
          }
        }
      }
      resolve();
    });
}