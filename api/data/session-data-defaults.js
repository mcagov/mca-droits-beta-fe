/*

Provide default values for user session data. These are automatically added
via the `sessionData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

============================================================================

Example usage:

"full-name": "Sarah Philips",

"options-chosen": [ "foo", "bar" ]

============================================================================

*/

export default {
  'report-date': '',
  'removed-property': '',
  'find-date': {
    day: '',
    month: '',
    year: ''
  },
  personal: {
    'full-name': '',
    email: '',
    'telephone-number': '',
    'address-line-1': '',
    'address-line-2': '',
    'address-town': '',
    'address-county': '',
    'address-postcode': ''
  }
};
