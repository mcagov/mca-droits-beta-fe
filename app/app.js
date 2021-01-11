import './assets/scss/app.scss'
import { initAll } from 'govuk-frontend'

initAll()

document.body.className = ((document.body.className) ? document.body.className + ' js-enabled' : 'js-enabled');

console.log('App script loaded');