// middleware/role.js
module.exports = function(requiredRoles) {
  return function(req, res, next) {
    const userRole = req.user && req.user.role;
    if (!userRole) return res.status(403).json({ message: 'Role not found' });
    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
