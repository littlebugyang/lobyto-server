const express = require('express')
const router = express.Router()
router.get('/', function (req, res, next) {
  console.log('Reach users/index.js')
})
module.exports = router
