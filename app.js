const express = require('express')
const moment = require('moment')
const bodyParser = require('body-parser')
const router = require('./core/router')

const app = express()

app.use(router)
// to parse the body of the request
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const port = require('./secret.js').port

app.listen(port, () => {
  console.log(`Lobyto-server listening at http://localhost:${port}`)
})