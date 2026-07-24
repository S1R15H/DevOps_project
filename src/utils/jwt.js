import jwt from 'jsonwebtoken';
import logger from '#config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Replace with your own secret key
const JWT_EXPIRESIN = '1d';

export const jwttoken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRESIN });
    } catch (e) {
      logger.error('Failed to authenticate token', e);
      throw e;
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      logger.error('Failed to verify token', e);
      throw e;
    }
  },
};
