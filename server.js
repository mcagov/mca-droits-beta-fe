import express from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import path from 'path';

import routes from './api';
import sessionInMemory from 'express-session';
import { sessionData, addCheckedFunction, matchRoutes } from './utils';
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

// Set views engine
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, './dist')));
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

// Load API routes
app.use('/', routes());

app.get(/^([^.]+)$/, function (req, res, next) {
  matchRoutes(req, res, next);
});
// Redirect all POSTs to GETs
app.post(/^\/([^.]+)$/, function (req, res) {
  res.redirect('/' + req.params[0]);
});

app.listen(PORT, () => {
  console.log(`App listening on ${PORT} - url: http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
