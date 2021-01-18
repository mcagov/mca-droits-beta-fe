import { Router } from 'express';

const route = Router();

export default function (app) {
  route.get('/', function (req, res, next) {
    res.render('report/start.html');
  });
}
