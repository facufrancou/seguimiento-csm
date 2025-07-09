import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './views/Home';
import CargaRemito from './views/CargaRemito';
import ValidacionQR from './views/ValidacionQR';
import Reportes from './views/Reportes';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import AltaUsuario from './views/AltaUsuario';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/validar') || location.pathname === '/validacion';
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="container mt-2">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/carga" element={<CargaRemito />} />
          <Route path="/validar/:token" element={<ValidacionQR />} />
          <Route path="/validacion" element={<ValidacionQR />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/alta-usuario" element={<AltaUsuario />} />
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
