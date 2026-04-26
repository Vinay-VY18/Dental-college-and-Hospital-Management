const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      req.user = decoded;
      req.admin = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const protectPatient = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      if (decoded.role !== 'PATIENT') {
        return res.status(403).json({ message: 'Not authorized for patient access' });
      }

      req.patient = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Patient token invalid or expired' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no patient token' });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || (!roles.includes(req.admin.role) && req.admin.role !== 'SUPER_ADMIN' && req.admin.role !== 'GLOBAL_ADMIN')) {
      return res.status(403).json({ message: `Role ${req.admin?.role} is not authorized to access this route` });
    }
    next();
  };
};

const protectStudent = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Student token invalid or expired' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no student token' });
};

module.exports = { protect, authorize, protectPatient, protectStudent };
