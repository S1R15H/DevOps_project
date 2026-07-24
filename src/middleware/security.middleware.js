import aj from '#config/arcjet';
import logger from '#config/logger';
import {slidingWindow} from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest'; // Default to 'guest' if no user is logged in

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin rate limit exceeded.';
        break;
      case 'user':
        limit = 10;
        message = 'User rate limit exceeded.';
        break;
      case 'guest':
      default:
        limit = 5;
        message = 'Guest rate limit exceeded.';
        break;
    }
    res.status(403).json({ error: 'Exceeded rate limit', message});

    const client = aj.withRule(slidingWindow({
      mode: 'LIVE',
      interval: '1m',
      max: limit,
      name: `${role}-rate-limit`,
    }));

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked:', { ip: req.ip, userAgent: req.get('User Agent'), path: req.path});
      return res.status(403).json({ error: 'Forbidden', message: 'Bot activity detected. Access denied.' });
    }
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield request blocked:', { ip: req.ip, userAgent: req.get('User Agent'), path: req.path, method: req.method});
      return res.status(403).json({ error: 'Forbidden', message: 'Request blocked by security policy' });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded:', { ip: req.ip, userAgent: req.get('User Agent'), path: req.path});
      return res.status(403).json({ error: 'Forbidden', message: 'Request blocked due to rate limiting.' });
    }

    next();
  } catch(e){
    console.error('Arcjet middleware error:', e);
    res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong with security middleware.' });
  }
};

export default securityMiddleware;