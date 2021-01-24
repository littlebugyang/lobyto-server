const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()
const orm = require('./orm')

let routesDir = 'routes'

// todo: modify it to the non-recursive one
// Recursively read the directory and build the router
function getAllRoutes (dir) {
  fs.readdirSync(dir).forEach((name) => {
    if (fs.statSync(path.join(dir, name)).isDirectory()) {
      getAllRoutes(path.join(dir, name))
    }
    if (name === 'index.js') {
      const route = path.join('/', path.relative(routesDir, dir)).
        replace(/\\/g, '/').replace(/_/g, ':')
      const requirePath = path.join('../', dir, name)
      // wrap the sub-router to pass argument
      router.use(route, require(requirePath)({
        orm,
        router: express.Router({ mergeParams: true }),
      })['router'])
    }
  })
}

getAllRoutes(routesDir)

module.exports = router