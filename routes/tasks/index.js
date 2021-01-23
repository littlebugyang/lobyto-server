module.exports = ({ router }) => {
  router.get('/', function (req, res, next) {
    res.send('Reach /tasks/index.js')
    console.log('Reach /tasks/index.js')
  })
  return router
}
