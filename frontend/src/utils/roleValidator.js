// Constantes para los roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  OPERARIO: 'operario',
  SUPERVISOR: 'supervisor'
};

// Mapa de permisos por ruta
export const ROUTE_PERMISSIONS = {
  '/': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.OPERARIO],
  '/carga': [ROLES.ADMIN, ROLES.SUPERVISOR],
  '/productos': [ROLES.ADMIN, ROLES.SUPERVISOR],
  '/remitos-pendientes': [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.OPERARIO],
  '/reportes': [ROLES.ADMIN, ROLES.SUPERVISOR],
  '/alta-usuario': [ROLES.ADMIN]
};

// Verifica si un usuario tiene permiso para acceder a una ruta específica
export const hasPermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

// Verifica si un usuario tiene permiso para acceder a una ruta específica
export const canAccessRoute = (userRole, route) => {
  const allowedRoles = ROUTE_PERMISSIONS[route];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

// Obtiene el rol del usuario actual desde localStorage
export const getCurrentUserRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.rol || null;
  } catch (error) {
    console.error('Error al obtener el rol del usuario:', error);
    return null;
  }
};
