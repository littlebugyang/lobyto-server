module.exports = ({ router }) => {
  context.router.get('/', function (req, res, next) {
    console.log(database.test)
    res.send('Reach /index.js')
    console.log('Reach /index.js')
  })
  return { router }
}