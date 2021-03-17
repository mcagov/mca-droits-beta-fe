export const addNunjucksFilters = function (env) {
  const coreFilters = require('../lib/core_filters')(env);
  const filters = Object.assign(coreFilters);
  Object.keys(coreFilters).forEach(function (filterName) {
    env.addFilter(filterName, filters[filterName]);
  });
};
