const express = require('express')
const mysql = require("mysql")
const moment = require("moment")
let bodyParser = require('body-parser')

const app = express()
const port = 3000

import secret from './secret'
const host = secret.host
const database_password = secret.database_password
const user_name = secret.user_name
const user_password = secret.user_password

let connectionPool = mysql.createPool({
    multipleStatements: true,
    connectionLimit: 1,
    host: host,
    user: 'root',
    password: database_password,
    database: 'lobyto'
})

// to parse the body of the request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

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
    let userName = req.body.userName
    let password = req.body.password
    let task = req.body.task

    // todo: handle body with null
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
            userName: user_name,
            password: user_password,
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
    let userName = req.body.userName
    let password = req.body.password
    let countdown = req.body.countdown
    countdown.length = parseInt(countdown.length, 10)
    countdown.startTime = moment(countdown.startTime).format("YYYY-MM-DD hh:mm:ss.SSSSSS")

    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        let sql = 'SELECT * FROM users'
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            const result = rows[0]
            if (result.user_name == userName && result.user_password == password) {
                sql = `INSERT INTO countdowns (countdown_start_time, countdown_length, user_id, task_id) values (?, ?, ?, ?); SELECT * FROM countdowns WHERE countdown_id=LAST_INSERT_ID()` // ? stands for to be escaped
                connection.query(sql, [countdown.startTime, countdown.length, result.user_id, countdown.taskId], (newErr, newRows, newFields) => {
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