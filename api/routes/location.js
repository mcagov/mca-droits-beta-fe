import { Router } from 'express';

const route = Router();

export default function (app) {
  app.use('/report/location', route);

  route.get('/', function (req, res, next) {
    res.render('report/location.html');
  });
}
