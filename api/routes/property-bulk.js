const { body, validationResult } = require('express-validator');
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { azureUpload } from '../../services';
import { formatValidationErrors } from '../../utils';
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
});

function fileFilter(req, file, cb) {
  // Allowed ext
  const filetypes = /csv/;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb('Error: The selected file must be a CSV');
  }
}

export default function (app) {
  app.post(
    "/report/property-bulk",
    upload.single("bulk-upload-file"),
    function(req,res){
      console.log(req.file.path);
      const fileRows = [];
        csv.parseFile(req.file.path, { headers: true })
          .on("data", function (data) {
            fileRows.push(data); // push each row
          })
          .on("end", function () {
            //console.log(fileRows); //contains array of objects. Each object represents row of the csv file, with each element of it a column
            fs.unlinkSync(req.file.path);   // remove temp file
            
            //process "fileRows" and respond  
            let fileUpload = fileRows;
            // Create a Map rather than an Object to ensure the items are output in the 
            // correct order when we loop through them in the template
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

              if(obj['Storage address line 1'] && obj['Postcode']) {
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

            req.session.data['property'] = sessionBulkUpload;
            var bulkUpload = sessionBulkUpload;
            console.log(req.session.data);
            res.render('report/property-bulk-confirm', { bulkUpload: bulkUpload });
          })
    });
  }


