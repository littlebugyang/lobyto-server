const express = require('express')
const bodyParser = require('body-parser')
const router = require('./core/router')

const app = express()

const baseURL = '/api/'
const version = 'v1'
// to parse the body of the request
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(baseURL + version, router)

const port = require('./secret.js').port

app.listen(port, () => {
  console.log(`Lobyto-server listening at http://localhost:${port}`)
})