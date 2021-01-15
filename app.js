const express = require("express")
const mysql = require("mysql")
const moment = require("moment")
const bodyParser = require("body-parser")

const app = express()

const secret = require("./secret.js")
const host = secret.host
const database_user_name = secret.database_user_name
const database_password = secret.database_password
const database_name = secret.database_name
const port = secret.port

let connectionPool = mysql.createPool({
    multipleStatements: true,
    connectionLimit: 1,
    host: host,
    user: database_user_name,
    password: database_password,
    database: database_name
})

// to parse the body of the request
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get("/", (req, res) => {
    // test connection
    res.send("Hello World!")
})

// app.get('/get_users', (req, res) => {
//     // single user system doesn't need this
// })

app.get("/get_tasks", (req, res) => {
    // page starts from 1
    // limit starts from 1
    const page = req.params.page || 1
    const limit = req.params.limit || 10
    console.log("Route to /get_tasks. ")
    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        const sql = "SELECT * FROM tasks LIMIT ? OFFSET ?"
        connection.query(sql, [limit, (page - 1) * limit], (error, rows, fields) => {
            if (error) throw error
            connection.release()
            res.send(rows)
        })
    })
})

app.get("/get_countdowns", (req, res) => {
    // page starts from 1
    // limit starts from 1
    const page = req.params.page || 1
    const limit = req.params.limit || 500
    console.log("Route to /get_countdowns. ")
    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        const sql = "SELECT * FROM countdowns LIMIT ? OFFSET ?"
        connection.query(sql, [limit, (page - 1) * limit], (error, rows, fields) => {
            if (error) throw error
            connection.release()
            res.send(rows)
        })
    })
})

app.post("/add_task", (req, res) => {
    console.log("Route to /add_task. ")
    let userName = req.body.userName
    let password = req.body.password
    let task = req.body.task

    // todo: handle body with null
    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        let sql = "SELECT * FROM users"
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            const result = rows[0]
            if (result.user_name === userName && result.user_password === password) {
                sql = `INSERT INTO tasks (user_id, task_title) VALUES (?, ?); SELECT * FROM tasks WHERE task_id=LAST_INSERT_ID();` // ? stands for to be escaped
                connection.query(sql, [result.user_id, task.title], (newErr, newRows, newFields) => {
                    if (newErr) throw newErr
                    connection.release()
                    console.log("Send back data: ", newRows[1])
                    res.send(newRows[1])
                })
            }
        })
    })
})

app.put("/update_task", (req, res) => {
    console.log("Route to /update_task. ")
    let userName = req.body.userName
    let password = req.body.password
    let task = req.body.task

    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        let sql = "SELECT * FROM users"
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            const result = rows[0]
            if (result.user_name === userName && result.user_password === password) {
                sql = `UPDATE tasks SET task_title=?, task_status=?, task_modified_time=CURRENT_TIMESTAMP(6) WHERE task_id=?; SELECT * FROM tasks WHERE task_id=?;` // ? stands for to be escaped
                connection.query(sql, [task.title, task.status, task.id, task.id], (newErr, newRows, newFields) => {
                    if (newErr) throw newErr
                    connection.release()
                    console.log("Send back data: ", newRows[1])
                    res.send(newRows[1])
                })
            }
        })
    })
})

app.post("/add_countdown", (req, res) => {
    console.log("Route to /add_countdown. ")
    let userName = req.body.userName
    let password = req.body.password
    let countdown = req.body.countdown
    countdown.length = parseInt(countdown.length, 10)
    countdown.startTime = moment(countdown.startTime).format("YYYY-MM-DD hh:mm:ss.SSSSSS")

    connectionPool.getConnection((err, connection) => {
        if (err) throw err // not connected
        let sql = "SELECT * FROM users"
        connection.query(sql, (error, rows, fields) => {
            if (error) throw error
            const result = rows[0]
            if (result.user_name === userName && result.user_password === password) {
                sql = `INSERT INTO countdowns (countdown_start_time, countdown_length, user_id, task_id) values (?, ?, ?, ?); SELECT * FROM countdowns WHERE countdown_id=LAST_INSERT_ID()` // ? stands for to be escaped
                connection.query(sql, [countdown.startTime, countdown.length, result.user_id, countdown.taskId], (newErr, newRows, newFields) => {
                    if (newErr) throw newErr
                    connection.release()
                    console.log("Send back data: ", newRows[1])
                    res.send(newRows[1])
                })
            }
        })
    })
})

app.listen(port, () => {
    console.log(`Lobyto-server listening at http://localhost:${port}`)
})