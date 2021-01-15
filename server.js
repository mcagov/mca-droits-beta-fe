// NPM dependencies
import express from 'express';
import bodyParser from 'body-parser';
import nunjucks from 'nunjucks';
import routes from './api';

// Core dependencies
const PORT = process.env.PORT || 5000;

// Local dependencies
import config from './app/js/config.js';

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

app.set('views', './app/views');

// Nunjucks config
app.set('view engine', 'html');

nunjucks.configure(['node_modules/govuk-frontend/', 'app/views/'], {
  autoescape: false,
  express: app,
  watch: true
});

// Add variables that are available in all views
app.locals.serviceName = config.serviceName;

// Load API routes
app.use('/', routes());

app.listen(PORT, () => {
  console.log(`App listening on ${PORT} - url: http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
