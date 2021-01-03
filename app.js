const express = require('express')
const mysql = require("mysql")

const app = express()
const port = 3000

const host = ""
const database_password = ""
const test_user_name = ""
const test_user_password = ""
// const host = "localhost"

let connectionPool = mysql.createPool({
    connectionLimit: 1,
    host: host,
    user: 'root',
    password: database_password,
    database: 'lobyto'
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/get_users', (req, res) => {
    connection.connect()
    const sql = 'SELECT * FROM users;'
    connection.query(sql, (err, rows, fields) => {
        if (err) throw err
        res.send(rows[0])
    })
})

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
    connection.connect()
    const sql = 'SELECT * FROM countdowns'
    connection.query(sql, (err, rows, fields) => {
        if (err) throw err
        res.send(rows)
    })
})

app.post('/add_task', (req, res) => {
    let userName = req.body.userName
    let password = req.body.password
    let task = req.body.task
    connection.connect()
    let sql = 'SELECT * FROM users'
    connection.query(sql, (err, rows, fields) => {
        if (err) throw err
        const result = JSON.parse(rows[0])
        if (result.userName == userName && result.password == password) {
            sql = `INSERT INTO tasks (user_id, task_title) VALUES (${result.user_id}, ${task.title});`
            connection.query(sql, (newErr, newRows, newFields) => {
                if (newErr) throw newErr
                res.send(newRows[0])
            })
        }
    })
})

app.get('/add_task', (req, res) => {
    const test = {
        body: {
            userName: test_user_name,
            password: test_user_password,
            task: {
                title: `''""''"'''d///a/\\\/sd/{}[a][1(*\``
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
                sql = `INSERT INTO tasks (user_id, task_title) VALUES (?, ?);` // ? stands for to be escaped
                console.log(sql)
                connection.query(sql, [result.user_id, task.title], (newErr, newRows, newFields) => {
                    if (newErr) throw newErr
                    connection.release()
                    res.send(newRows)
                })
            }
        })
    })
})

app.post('/add_countdown', (req, res) => {

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})