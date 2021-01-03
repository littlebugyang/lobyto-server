const express = require('express')
const mysql = require("mysql")
const moment = require("moment")

const app = express()
const port = 3000

const host = ""
const database_password = ""
const test_user_name = ""
const test_user_password = ""

let connectionPool = mysql.createPool({
    multipleStatements: true,
    connectionLimit: 1,
    host: host,
    user: 'root',
    password: database_password,
    database: 'lobyto'
})

app.get('/', (req, res) => {
    // test connection
    res.send('Hello World!')
})

// app.get('/get_users', (req, res) => {
//     // single user system doesn't need this
// })

app.get('/get_tasks', (req, res) => {
    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        const sql = 'SELECT * FROM tasks'
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            connection.release()
            res.send(rows)
        })
    })
})

app.get('/get_countdowns', (req, res) => {
    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        const sql = 'SELECT * FROM countdowns'
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            connection.release()
            res.send(rows)
        })
    })
})

app.post('/add_task', (req, res) => {
    // const test = {
    //     body: {
    //         userName: test_user_name,
    //         password: test_user_password,
    //         task: {
    //             title: `Test 123`
    //         }
    //     }
    // }
    let userName = req.body.userName
    let password = req.body.password
    let task = req.body.task

    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        let sql = 'SELECT * FROM users'
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            const result = rows[0]
            if (result.user_name == userName && result.user_password == password) {
                sql = `INSERT INTO tasks (user_id, task_title) VALUES (?, ?); SELECT * FROM tasks WHERE task_id=LAST_INSERT_ID();` // ? stands for to be escaped
                connection.query(sql, [result.user_id, task.title], (newErr, newRows, newFields) => {
                    if (newErr) throw newErr
                    connection.release()
                    res.send(newRows[1])
                })
            }
        })
    })
})

app.put('/update_task', (req, res) => {
    const test = {
        body: {
            userName: test_user_name,
            password: test_user_password,
            task: {
                id: 1,
                title: ``,
                status: 1
            }
        }
    }
    let userName = test.body.userName
    let password = test.body.password
    let task = test.body.task

    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        let sql = 'SELECT * FROM users'
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            const result = rows[0]
            if (result.user_name == userName && result.user_password == password) {
                sql = `UPDATE tasks SET task_title=?, task_status=?, task_modified_time=CURRENT_TIMESTAMP(6) WHERE task_id=?; SELECT * FROM tasks WHERE task_id=?;` // ? stands for to be escaped
                console.log(sql)
                connection.query(sql, [task.title, task.status, task.id, task.id], (newErr, newRows, newFields) => {
                    if (newErr) throw newErr
                    res.send(newRows[1])
                })
            }
        })
    })
})

app.post('/add_countdown', (req, res) => {
    const test = {
        body: {
            userName: test_user_name,
            password: test_user_password,
            countdown: {
                startTime: 1609679478828,
                taskId: 1,
                length: 45
            }
        }
    }
    let userName = req.body.userName
    let password = req.body.password
    let countdown = req.body.countdown

    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        let sql = 'SELECT * FROM users'
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            const result = rows[0]
            if (result.user_name == userName && result.user_password == password) {
                sql = `INSERT INTO countdowns (countdown_start_time, countdown_length, user_id, task_id) values (?, ?, ?, ?); SELECT * FROM countdowns WHERE countdown_id=LAST_INSERT_ID()` // ? stands for to be escaped
                connection.query(sql, [moment(countdown.startTime).format("YYYY-MM-DD hh:mm:ss.SSSSSS"), countdown.length, result.user_id, countdown.taskId], (newErr, newRows, newFields) => {
                    if (newErr) throw newErr
                    connection.release()
                    res.send(newRows[1])
                })
            }
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})