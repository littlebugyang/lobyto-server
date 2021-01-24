const moment = require('moment')

module.exports = ({ router, orm }) => {
  // get all countdowns
  router.get('/', function (req, res, next) {
    // page starts from 1
    // limit starts from 1
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.perPage) || 300
    orm.connectionPool.getConnection((err, connection) => {
      if (err) throw err // not connected
      const sql = 'SELECT * FROM countdowns ORDER BY countdown_id DESC LIMIT ? OFFSET ?'
      connection.query(sql, [limit, (page - 1) * limit],
        (error, rows, fields) => {
          if (error) throw error
          connection.release()
          res.send(rows)
        })
    })
  })

  // add a new countdown
  router.post('/', (req, res) => {
    let userName = req.body.userName
    let password = req.body.password
    let countdown = req.body.countdown
    countdown.length = parseInt(countdown.length, 10)
    countdown.startTime = moment(countdown.startTime).
      format('YYYY-MM-DD hh:mm:ss.SSSSSS')

    orm.connectionPool.getConnection((err, connection) => {
      if (err) throw err // not connected
      let sql = 'SELECT * FROM users'
      connection.query(sql, (error, rows, fields) => {
        if (error) throw error
        const result = rows[0]
        if (result.user_name === userName && result.user_password ===
          password) {
          sql = `INSERT INTO countdowns (countdown_start_time, countdown_length, user_id, task_id) values (?, ?, ?, ?); SELECT * FROM countdowns WHERE countdown_id=LAST_INSERT_ID()` // ? stands for to be escaped
          connection.query(sql, [
            countdown.startTime,
            countdown.length,
            result.user_id,
            countdown.taskId], (newErr, newRows, newFields) => {
            if (newErr) throw newErr
            connection.release()
            console.log('Send back data: ', newRows[1])
            res.send(newRows[1])
          })
        }
      })
    })
  })
  return { router }
}