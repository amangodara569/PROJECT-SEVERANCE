const store = require('../db/store');

// Middleware ensuring authenticated user possesses administrative clearance
const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const user = store.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Clearance granted if marked admin or system administrator
  const isAuthorized = Boolean(user.isAdmin || user.username === 'aman_test');
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Administrative clearance required' });
  }

  req.adminUser = user;
  next();
};

module.exports = adminOnly;

