import express from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';

import routes from './api';
import sessionInMemory from 'express-session';
import { autoStoreData, addCheckedFunction, matchRoutes } from './utils';
import config from './app/js/config.js';

const PORT = process.env.PORT || 5000;

const app = express();

// Add variables that are available in all views
app.locals.serviceName = config.serviceName

// Support for parsing data in POSTs
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(express.static('dist'));

app.set('trust proxy', 1); // needed for secure cookies on heroku

// Redirect any asset requests to the relevant location in the gov uk frontend kit
app.use(
  '/assets',
  express.static('./node_modules/govuk-frontend/govuk/assets')
);

// Nunjucks config
app.set('view engine', 'html');

// Configure nunjucks environment
const nunjucksAppEnv = nunjucks.configure(
  ['node_modules/govuk-frontend/', 'app/views/'],
  {
    autoescape: false,
    express: app,
    watch: true
  }
);
addCheckedFunction(nunjucksAppEnv);
app.set('views', './app/views');

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

// Automatically store all data users enter
app.use(autoStoreData);

// Load API routes
app.use('/', routes());

app.get(/^([^.]+)$/, function (req, res, next) {
  matchRoutes(req, res, next);
});
// Redirect all POSTs to GETs - this allows users to use POST for autoStoreData
app.post(/^\/([^.]+)$/, function (req, res) {
  console.log(req.params[0]);

  res.redirect('/' + req.params[0]);
});

app.listen(PORT, () => {
  console.log(`App listening on ${PORT} - url: http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
