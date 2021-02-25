import express from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import path from 'path';
import edt from 'express-debug';

import routes from './api/routes';
import sessionInMemory from 'express-session';
import {
  sessionData,
  addCheckedFunction,
  matchRoutes,
  addNunjucksFilters
} from './utils';
import config from './app/js/config.js';

const PORT = process.env.PORT || 5000;

const app = express();

// Add variables that are available in all views
app.locals.serviceName = config.serviceName;

// Support for parsing data in POSTs
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.set('trust proxy', 1); // needed for secure cookies on heroku

// Configure nunjucks environment
const nunjucksAppEnv = nunjucks.configure(
  [
    path.join(__dirname, './node_modules/govuk-frontend/'),
    path.join(__dirname, './app/views/')
  ],
  {
    autoescape: false,
    express: app,
    watch: process.env.NODE_ENV === 'development' ? true : false
  }
);
addCheckedFunction(nunjucksAppEnv);
addNunjucksFilters(nunjucksAppEnv);

// Set views engine
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, './dist')));
app.use('/uploads', express.static('uploads'));
app.use(
  '/assets',
  express.static(
    path.join(__dirname, './node_modules/govuk-frontend/govuk/assets')
  )
);

// Session uses service name to avoid clashes with other prototypes
const sessionName = Buffer.from(config.serviceName, 'utf8').toString('hex');
const sessionOptions = {
  secret: sessionName,
  resave: false,
  saveUninitialized: true,
  unset: 'destroy',
  cookie: {
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
    secure: false
  }
};

app.use(
  sessionInMemory(
    Object.assign(sessionOptions, {
      name: sessionName,
      resave: false,
      saveUninitialized: false
    })
  )
);

// Manage session data. Assigns default values to data
app.use(sessionData);

// Logs req.session data
if (process.env.NODE_ENV === 'development') edt(app, { panels: ['session'] });

// Load API routes
app.use('/', routes());

// Auto render any view that exists
app.get(/^([^.]+)$/, function (req, res, next) {
  matchRoutes(req, res, next);
});

// Redirect all POSTs to GETs
app.post(/^\/([^.]+)$/, function (req, res) {
  res.redirect('/' + req.params[0]);
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error(`Page not found: ${req.path}`);
  err.status = 404;

  next(err);
});

// Display error
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  if (err.message.startsWith('template not found')) {
    res.status(404).render('404');
  }
});
app.listen(PORT, () => {
  console.log(`App listening on ${PORT} - url: http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
