const { body, validationResult } = require('express-validator');
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { azureUpload } from '../../services';
import { formatValidationErrors } from '../../utils';
const csv = require('fast-csv');

/*const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `./uploads/csv`;
    fs.mkdirSync(path, { recursive: true });
    cb(null, './uploads/csv');
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
  //const filetypes = /csv/;

  // Check ext
  //const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb('Error: The selected file must be a CSV');
  }
}*/

/*export default function (app) {
  app.post(
    '/report/property-bulk', (req, res) => {

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
        // Check mime
        const mimetype = filetypes.test(file.mimetype);
      
        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb('Error: The selected file must be a CSV');
        }
      }

      upload(req, res, function(err) {
        console.log(req.file);

        if (req.fileValidationError) {
          return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select a file to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send(`You have uploaded this file: <p>${req.file.path}</p>`);
  
        /*const fileRows = [];
        csv.fromPath(req.file.path)
          .on("data", function (data) {
            fileRows.push(data); // push each row
          })
          .on("end", function () {
            console.log(fileRows); //contains array of arrays. Each inner array represents row of the csv file, with each element of it a column
            //fs.unlinkSync(req.file.path);   // remove temp file
            //process "fileRows" and respond
          })*/
  
        ///Quick test for logic to upload image to azure
        ///and delete temp image when complete
  
        // const data = fs.createReadStream(
        //   `${path.resolve(__dirname + '/../../uploads/')}/${req.file.filename}`
        // );
        // azureUpload(data, req.file.filename);
  
        /*const id = req.params.prop_id;
        req.session.data.property[id].image = req.file.filename;
        req.session.save();
        res.json(req.file.path);
      })
    }
  );
}*/

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
    console.log(file.mimetype);
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
            console.log(fileRows); //contains array of objects. Each object represents row of the csv file, with each element of it a column
            fs.unlinkSync(req.file.path);   // remove temp file
            //process "fileRows" and respond            
          })
    });
  }


