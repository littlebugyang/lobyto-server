const express = require('express')
const router = express.Router()
router.get('/', function (req, res, next) {
  console.log('Reach tasks/index.js')
})
module.exports = router
