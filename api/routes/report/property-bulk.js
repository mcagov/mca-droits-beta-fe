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
          console.log('test');
          res.json({ error: err });
        } else {
          const fileRows = [];
          csv.parseFile(req.file.path, {
            headers: true
          })
            /*.validate((row) => {
              Object.keys(row).forEach((key) => {
                return row[key] === '';
              })
            })*/
            /*.on('data-invalid', (row) => {
              err.text = 'Please make sure you have filled out all of the information in your bulk upload spreadsheet';
              return res.json({ error: err });
            })*/
            .on('error', (errorMsg) => {
              console.log(errorMsg);
            })
            .on("data", function (data) {
              fileRows.push(data); // push each row
            })
            .on("end", function () {
              fs.unlinkSync(req.file.path);   // remove temp file
              console.log(fileRows);
              const validationError = validateCsvData(fileRows);
              if (validationError) {
                err.text = validationError;
                return res.json({ error: err });
              }
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

  // Loop through csv file rows and run validation function on each row
  function validateCsvData(rows) {
    const dataRows = rows.slice(1, rows.length); //ignore header at 0 and get rest of the rows
    console.log(dataRows);
    for (let i = 0; i < dataRows.length; i++) {
      // Check for empty cells within the current row
      const rowError = validateCsvRow(dataRows[i]);
      if (rowError) {
        return rowError;
      }
    }
    return;
  }

  function validateCsvRow(row) {
    if (Object.values(row).includes('')) {
      return "The selected file contains some empty values. Please check that you have entered all of the required information for each item of wreck material."
    }
    return;
  }
}


