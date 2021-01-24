module.exports = ({ router, orm }) => {
  // update a task
  router.put('/', (req, res) => {
    let userName = req.body.userName
    let password = req.body.password
    let task = req.body.task

    orm.connectionPool.getConnection((err, connection) => {
      if (err) throw err // not connected
      let sql = 'SELECT * FROM users'
      connection.query(sql, (error, rows, fields) => {
        if (error) throw error
        const result = rows[0]
        if (result.user_name === userName &&
          result.user_password === password) {
          sql = `UPDATE tasks SET task_title=?, task_status=?, task_modified_time=CURRENT_TIMESTAMP(6) WHERE task_id=?; SELECT * FROM tasks WHERE task_id=?;` // ? stands for to be escaped
          connection.query(sql, [task.title, task.status, task.id, task.id],
            (newErr, newRows, newFields) => {
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