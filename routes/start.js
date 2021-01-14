
const express = require('express')
const path = require('path')
const router = express.Router()

router.get('/', function(req, res, next) {
  res.render('pages/start.html')
});

module.exports = router