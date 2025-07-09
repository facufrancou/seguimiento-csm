// app.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
/* const bodyParser = require('body-parser'); */
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const remitoRoutes = require('./routes/remitoRoutes');
const entregaRoutes = require('./routes/entregaRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración CORS específica para frontend
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
/* app.use(bodyParser.json()); */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET || 'seguimiento123',
  resave: false,
  saveUninitialized: true
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/remitos', remitoRoutes);
app.use('/api/entregas', entregaRoutes);

app.get('/', (req, res) => {
  res.send('API Seguimiento de Entregas funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
