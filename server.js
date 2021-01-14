// Core dependencies
const fs = require('fs')
const PORT = process.env.PORT || 3000

// NPM dependencies
const express = require('express')
const startRoute = require('./app/routes/start')
const removedPropertyCheckRoute = require('./app/routes/removed-property-check')
const path = require('path')
const nunjucks = require('nunjucks')

// Local dependencies
const config = require('./app/src/config.js')

const app = express()

app.use(express.static('dist'))
// Redirect any asset requests to the relevant location in the gov uk frontend kit
app.use('/assets', express.static('./node_modules/govuk-frontend/govuk/assets'))

// Nunjucks config
app.set("view engine", "html")

nunjucks.configure([
  "node_modules/govuk-frontend/",
  'app/views/'
],
{
  autoescape: false,
  express: app
})

// Add variables that are available in all views
app.locals.serviceName = config.serviceName

// Routes - may need importing from a main 'routes' script, rather than individually?
app.use('/', startRoute)
app.use('/removed-property-check', removedPropertyCheckRoute)
        
app.listen(PORT, () => {
    console.log(`App listening on ${PORT} - url: http://localhost:${PORT}`)
    console.log('Press Ctrl+C to quit.')
})
