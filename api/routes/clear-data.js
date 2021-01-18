import { Router } from 'express';

const route = Router();

export default function (app) {
  route.get('/', function (req, res, next) {
    req.session.data = {};
    res.render('index.html');
  });
}
