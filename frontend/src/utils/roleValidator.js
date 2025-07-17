export const hasPermission = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};
