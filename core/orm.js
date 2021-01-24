const mysql = require('mysql')
const secret = require('../secret')
const host = secret.host
const database_user_name = secret.database_user_name
const database_password = secret.database_password
const database_name = secret.database_name

let connectionPool = mysql.createPool({
  multipleStatements: true,
  connectionLimit: 1,
  host: host,
  user: database_user_name,
  password: database_password,
  database: database_name,
})

module.exports = {
  connectionPool,
}