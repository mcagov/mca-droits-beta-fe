import express from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import path from 'path';
import edt from 'express-debug';
import {
  sessionData,
  addCheckedFunction,
  matchRoutes,
  addNunjucksFilters,
  forceHttps
} from './utils';
import routes from './api/routes';
import config from './app/config.js';

import sessionInMemory from 'express-session';

const PORT = process.env.PORT || config.PORT;
const app = express();

// Global vars
app.locals.serviceName = config.SERVICE_NAME;

// Local vars
const env = process.env.NODE_ENV;
let useHttps = process.env.USE_HTTPS || config.USE_HTTPS;

useHttps = useHttps.toLowerCase();

// Production session data
const session = require('express-session');
const AzureTablesStoreFactory = require('connect-azuretables')(session);

const isSecure = env === 'production' && useHttps === 'true';
if (isSecure) {
  app.use(forceHttps);
}

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
    watch: env === 'development' ? true : false
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
const sessionName = Buffer.from(config.SERVICE_NAME, 'utf8').toString('hex');
const sessionOptions = {
  secret: sessionName,
  cookie: {
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
    secure: isSecure
  }
};
if (env === 'development') {
  app.use(
    sessionInMemory(
      Object.assign(sessionOptions, {
        name: sessionName,
        resave: false,
        saveUninitialized: false
      })
    )
  );
} else {
  app.use(
    session(
      Object.assign(sessionOptions, {
        store: AzureTablesStoreFactory.create(),
        resave: false,
        saveUninitialized: false
      })
    )
  );
}

// Manage session data. Assigns default values to data
app.use(sessionData);

// Logs req.session data
if (env === 'development') edt(app, { panels: ['session'] });

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
