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
} from './utilities';
import routes from './api/routes';
import config from './app/config.js';
const dotenv = require('dotenv');
dotenv.config();
import helmet from 'helmet';

import sessionInMemory from 'express-session';
import { NONAME } from 'dns';

const app = express();
const PORT = process.env.PORT || config.PORT;

// Global vars
app.locals.serviceName = config.SERVICE_NAME;

// Local vars
const env = process.env.NODE_ENV;

if (env === 'production') {
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'unpkg.com', 'cdnjs.cloudflare.com'],
        scriptSrc: [
          "'self'",
          "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
          'unpkg.com',
          'cdnjs.cloudflare.com',
        ],
        styleSrc: [
          "'self'",
          'cdn.jsdelivr.net',
          'cdnjs.cloudflare.com',
          'unpkg.com',
        ],
        imgSrc: [
          "'self'",
          'data:',
          '*.tile.openstreetmap.org',
          'cdnjs.cloudflare.com',
          'unpkg.com',
          process.env.AZURE_BLOB_IMAGE_URL,
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    })
  );
}

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
    extended: true,
  })
);

app.set('trust proxy', 1); // needed for secure cookies on heroku

// Configure nunjucks environment
const nunjucksAppEnv = nunjucks.configure(
  [
    path.join(__dirname, './node_modules/govuk-frontend/'),
    path.join(__dirname, './app/views/'),
  ],
  {
    autoescape: false,
    express: app,
    watch: env === 'development' ? true : false,
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
  },
};
if (env === 'development') {
  app.use(
    sessionInMemory(
      Object.assign(sessionOptions, {
        name: sessionName,
        resave: false,
        saveUninitialized: false,
      })
    )
  );
} else {
  app.use(
    session(
      Object.assign(sessionOptions, {
        store: AzureTablesStoreFactory.create(),
        resave: false,
        saveUninitialized: false,
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

app.get('/', function(req, res){
  res.redirect(process.env.ROOT_URL);
})

// Disables caching when user clicks back button on confirmation page
app.use('/report/check-your-answers', function (req, res, next) {
  res.set(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  );
  next();
});

app.get(/^([^.]+)$/, function (req, res, next) {
  if (config.SERVICE_UNAVAILABLE === true) {
    console.log('Service Unavailable.');
    res.status('503');
    res.sendFile(path.join(__dirname, '/app/static/service-unavailable.html'));
  } else {
    matchRoutes(req, res, next);
  }
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

  if (err.message.indexOf('not found') > 0) {
    res.status(404).render('404');
  }
});

app.listen(PORT, () => {
  console.log(`App listening on ${PORT} - url: http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
