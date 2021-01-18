import { Router } from 'express';

const route = Router();

export default function (app) {
  app.use('/clear', route);

  route.get('/', function (req, res, next) {
    req.session.data = {};
    res.render('index.html');
  });
}
