import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './views/Home';
import CargaRemito from './views/CargaRemito';
import ValidacionQR from './views/ValidacionQR';
import Reportes from './views/Reportes';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import AltaUsuario from './views/AltaUsuario';
import RemitosPendientes from './components/RemitosPendientes';
import Productos from './views/Productos';

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('token');
  return isLoggedIn ? children : <Navigate to="/login" />;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/validar') || location.pathname === '/validacion';
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="container mt-2">
        <Routes>
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/carga" element={<PrivateRoute><CargaRemito /></PrivateRoute>} />
          <Route path="/validar/:token" element={<ValidacionQR />} />
          <Route path="/validar" element={<ValidacionQR />} />
          <Route path="/validacion" element={<ValidacionQR />} />
          <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
          <Route path="/remitos-pendientes" element={<PrivateRoute><RemitosPendientes /></PrivateRoute>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/alta-usuario" element={<PrivateRoute><AltaUsuario /></PrivateRoute>} />
          <Route path="/productos" element={<PrivateRoute><Productos /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
