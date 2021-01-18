import { Router } from 'express';

const route = Router();

export default function (app) {
  app.use('/report/removed-property-check', route);

  route
    .get('/', function (req, res, next) {
      res.render('report/removed-property-check.html');
    })

    .post('/', function (req, res) {
      // Get the answer from session data
      // The name between the quotes is the same as the 'name' attribute on the input elements
      // However in JavaScript we can't use hyphens in variable names

      const value = req.session.data['removed-property'];

      // Throw the current date in here as it's a good a place as any!
      const date = new Date();
      const day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear();

      // We add 0 to the start of the date and slice the last two digits off to ensure leading zeros.
      req.session.data['report-date'] = {};
      req.session.data['report-date']['day'] = ('0' + day).slice(-2);
      req.session.data['report-date']['month'] = ('0' + month).slice(-2);
      req.session.data['report-date']['year'] = year;

      if (value === 'yes') {
        res.redirect('/report/find-date');
      } else {
        res.redirect('/report/not-removed-property-content');
      }
    });
}
