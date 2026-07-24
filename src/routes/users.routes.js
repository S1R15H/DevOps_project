import express from 'express';
import { fetchAllUsers, getUserById, updateUser, deleteUser } from '#controllers/users.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', requireRole(['admin']), fetchAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;