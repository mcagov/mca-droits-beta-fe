import { Router } from 'express';

const route = Router();

export default function (app) {
  app.use('/report/not-removed-property-content', route);

  route.get('/', function (req, res, next) {
    res.render('report/not-removed-property-content.html');
  });
}
