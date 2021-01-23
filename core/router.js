const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()

let routesDir = 'routes'

// todo: modify it to the non-recursive one
function getAllRoutes (dir) {
  fs.readdirSync(dir).forEach((name) => {
    if (fs.statSync(path.join(dir, name)).isDirectory()) {
      getAllRoutes(path.join(dir, name))
    }
    if (name === 'index.js') {
      const route = path.join('/', path.relative(routesDir, dir)).
        replace(/\\/g, '/').replace(/_/g, ':')
      const requirePath = path.join('../', dir, name)
      router.use(route, require(requirePath)({
        router: express.Router({ mergeParams: true }),
      }))
    }
  })
}

getAllRoutes(routesDir)

module.exports = router