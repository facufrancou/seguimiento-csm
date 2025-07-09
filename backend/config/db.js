// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: 'seguimiento_entregas', // Cambiado a seguimiento_entregas para coincidir con tu base
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log("base lista");
module.exports = pool;
