module.exports = ({ router }) => {
  router.get('/', function (req, res, next) {
    res.send('Lobyto server. ')
  })
  return { router }
}