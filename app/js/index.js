import '../scss/index.scss';
import { initAll } from 'govuk-frontend';

initAll();

document.body.className = document.body.className
  ? document.body.className + ' js-enabled'
  : 'js-enabled';

// Components
import "./components/editableMap.js"
