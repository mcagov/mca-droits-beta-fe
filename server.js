import express from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';

import routes from './api';
import sessionInMemory from 'express-session';
import { autoStoreData, addCheckedFunction } from './utils';
import config from './app/js/config.js';

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());

app.use(express.static('dist'));

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
  cookie: {
    maxAge: 1000 * 60 * 60 * 4, // 4 hours
    secure: true
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

// Clear all data in session if you open /prototype-admin/clear-data
app.post('/prototype-admin/clear-data', function (req, res) {
  req.session.data = {};
  res.render('prototype-admin/clear-data-success');
});

// Load API routes
app.use('/', routes());

app.listen(PORT, () => {
  console.log(`App listening on ${PORT} - url: http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
