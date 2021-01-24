module.exports = ({ router }) => {
  router.get('/', function (req, res, next) {
    res.send('Reach /users/index.js')
    console.log('Reach /users/index.js')
  })
  return { router }
}