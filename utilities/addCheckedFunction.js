import getKeypath from 'keypather/get';

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
