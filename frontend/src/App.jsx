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
import { canAccessRoute, getCurrentUserRole } from './utils/roleValidator';

function PrivateRoute({ children, path }) {
  const isLoggedIn = localStorage.getItem('token');
  const userRole = getCurrentUserRole();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  if (!canAccessRoute(userRole, path)) {
    // Si el usuario está logueado pero no tiene acceso a esta ruta
    // Lo redirigimos a la página de inicio o a la de remitos pendientes si es operario
    return userRole === 'operario' 
      ? <Navigate to="/remitos-pendientes" />
      : <Navigate to="/" />;
  }
  
  return children;
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/validar') || location.pathname === '/validacion';
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="container mt-2">
        <Routes>
          <Route path="/" element={<PrivateRoute path="/"><Home /></PrivateRoute>} />
          <Route path="/carga" element={<PrivateRoute path="/carga"><CargaRemito /></PrivateRoute>} />
          <Route path="/validar/:token" element={<ValidacionQR />} />
          <Route path="/validar" element={<ValidacionQR />} />
          <Route path="/validacion" element={<ValidacionQR />} />
          <Route path="/reportes" element={<PrivateRoute path="/reportes"><Reportes /></PrivateRoute>} />
          <Route path="/remitos-pendientes" element={<PrivateRoute path="/remitos-pendientes"><RemitosPendientes /></PrivateRoute>} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/alta-usuario" element={<PrivateRoute path="/alta-usuario"><AltaUsuario /></PrivateRoute>} />
          <Route path="/productos" element={<PrivateRoute path="/productos"><Productos /></PrivateRoute>} />
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
