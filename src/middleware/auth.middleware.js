import logger from '#config/logger';
import { jwttoken } from '#utils/jwt';
import { cookies } from '#utils/cookies';

export const authenticateToken = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token');
        
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;
    next();
  } catch (e) {
    logger.error(`Authentication error: ${e.message}`);
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
