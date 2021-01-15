import { Router } from 'express';

const route = Router();

export default function (app) {
  app.use('/', route);

  route.get('/', function (req, res, next) {
    res.render('report/start.html');
  });
}
