module.exports = ({ router, orm }) => {
  // get tasks
  router.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.perPage) || 100
    const status = req.query.status || '%'
    orm.connectionPool.getConnection((err, connection) => {
      if (err) throw err // not connected
      const sql = 'SELECT * FROM tasks WHERE task_status=? ORDER BY task_id DESC LIMIT ? OFFSET ? ;'
      connection.query(sql, [status, limit, (page - 1) * limit],
        (error, rows, fields) => {
          if (error) throw error
          connection.release()
          res.send(rows)
        })
    })
  })

  // add a new task
  router.post('/', (req, res) => {
    let userName = req.body.userName
    let password = req.body.password
    let task = req.body.task
    // todo: handle body with null
    orm.connectionPool.getConnection((err, connection) => {
      if (err) throw err // not connected
      let sql = 'SELECT * FROM users'
      connection.query(sql, (error, rows, fields) => {
        if (error) throw error
        const result = rows[0]
        if (result.user_name === userName && result.user_password ===
          password) {
          sql = `INSERT INTO tasks (user_id, task_title) VALUES (?, ?); SELECT * FROM tasks WHERE task_id=LAST_INSERT_ID();` // ? stands for to be escaped
          connection.query(sql, [result.user_id, task.title],
            (newErr, newRows, newFields) => {
              if (newErr) throw newErr
              connection.release()
              res.send(newRows[1])
            })
        }
      })
    })
  })

  return { router }
}