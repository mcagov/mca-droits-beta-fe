import getKeypath from 'keypather/get';
import sessionDataDefaults from './api/data/session-data-defaults';

export const sessionData = (req, res, next) => {
  if (!req.session.data) {
    req.session.data = {};
  }
  req.session.data = Object.assign({}, sessionDataDefaults, req.session.data);

  // Send session data to all views

  res.locals.data = {};

  for (var j in req.session.data) {
    res.locals.data[j] = req.session.data[j];
  }

  next();
};

// Add Nunjucks function called 'checked' to populate radios and checkboxes
export const addCheckedFunction = (env) => {
  env.addGlobal('checked', function (name, value) {
    // Check data exists
    if (this.ctx.data === undefined) {
      return '';
    }
    // Use string keys or object notation to support:
    // checked("field-name")
    // checked("['field-name']")
    // checked("['parent']['field-name']")
    name = !name.match(/[.[]/g) ? `['${name}']` : name;
    var storedValue = getKeypath(this.ctx.data, name);
    // Check the requested data exists
    if (storedValue === undefined) {
      return '';
    }
    var checked = '';
    // If data is an array, check it exists in the array
    if (Array.isArray(storedValue)) {
      if (storedValue.indexOf(value) !== -1) {
        checked = 'checked';
      }
    } else {
      // The data is just a simple value, check it matches
      if (storedValue === value) {
        checked = 'checked';
      }
    }
    return checked;
  });
};

// Try to match a request to a template, for example a request for /test
// would look for /app/views/test.html
// and /app/views/test/index.html

function renderPath(path, res, next) {
  // Try to render the path
  res.render(path, function (error, html) {
    if (!error) {
      // Success - send the response
      res.set({ 'Content-type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }
    if (!error.message.startsWith('template not found')) {
      // We got an error other than template not found - call next with the error
      next(error);
      return;
    }
    if (!path.endsWith('/index')) {
      // Maybe it's a folder - try to render [path]/index.html
      renderPath(path + '/index', res, next);
      return;
    }
    // We got template not found both times - call next to trigger the 404 page
    next();
  });
}

export const matchRoutes = (req, res, next) => {
  var path = req.path;

  // Remove the first slash, render won't work with it
  path = path.substr(1);

  // If it's blank, render the root index
  if (path === '') {
    path = 'index';
  }

  renderPath(path, res, next);
};

export const formatValidationErrors = (errorsInstance) => {
  if (errorsInstance.isEmpty()) {
    return false;
  }
  const errors = errorsInstance.array();
  const formattedErrors = {};
  errors.forEach((error) => {
    formattedErrors[error.param] = {
      id: error.param,
      href: '#' + error.param,
      value: error.value,
      text: error.msg
    };
  });
  return formattedErrors;
};
