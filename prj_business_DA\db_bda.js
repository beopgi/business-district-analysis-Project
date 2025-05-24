// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // 사용자에 맞게 변경
  password: '0294',   // 비밀번호에 맞게 변경
  database: 'prj_bda',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
