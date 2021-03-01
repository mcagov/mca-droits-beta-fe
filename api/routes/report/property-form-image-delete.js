import fs from 'fs';

export default function (app) {
  app.post('/report/property-form-image-delete/:prop_id', function (req, res) {
    const id = req.params.prop_id;
    const image = req.session.data.property[id].image;

    fs.unlink(`uploads/${image}`, (err) => {
      if (err) console.log(err);
      else {
        console.log(`\nDeleted file @ uploads/${image}`);
      }
    });

    req.session.data.property[id].image = '';
    req.session.save();
    res.json();
  });
}
