import '../scss/index.scss';
import { initAll } from 'govuk-frontend';

initAll();

document.body.className = document.body.className
  ? document.body.className + ' js-enabled'
  : 'js-enabled';

// Components
import './components/editableMap.js';
import './components/staticMap.js';
import './components/imageUpload.js';
import './components/spreadsheetUpload.js';
import './components/bulkImageUpload.js';
import './components/reportFilter.js';
import './components/portalSort.js';
import './components/actionConfirmation.js';
import { lightbox } from './components/lightbox';

// Utilities
import { windowPrint } from './utilities/printWindow';
import { polyfills } from './utilities/polyfills';
import './utilities/conditionalContent';
