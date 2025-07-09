// utils/generarTokenQR.js
const crypto = require('crypto');

function generarTokenQR() {
  return crypto.randomBytes(20).toString('hex'); // 40 caracteres alfanuméricos
}

module.exports = generarTokenQR;
