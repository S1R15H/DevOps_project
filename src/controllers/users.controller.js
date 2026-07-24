import logger from '#config/logger';
import {
  getAllUsers,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from '#services/users.services';
import { userIdSchema, updateUserSchema } from '#validations/users.validation';
import { formatValidationError } from '#utils/format';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users ...');
    const allUsers = await getAllUsers();
    res.json({
      message: 'Users fetched successfully',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    logger.info(`Getting user by id: ${id}`);
    const user = await getUserByIdService(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User fetched successfully',
      user,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(bodyValidation.error),
      });
    }

    const { id } = idValidation.data;
    const updates = bodyValidation.data;
    const currentUser = req.user || { role: 'guest', id: null };

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res.status(403).json({
        error: 'Forbidden: You can only update your own information.',
      });
    }

    if (updates.role && currentUser.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Forbidden: You cannot change your role.' });
    }

    logger.info(`Updating user with id: ${id}`);
    const updatedUser = await updateUserService(id, updates);

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error(e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationError(idValidation.error),
      });
    }

    const { id } = idValidation.data;
    const currentUser = req.user || { role: 'guest', id: null };

    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      return res
        .status(403)
        .json({ error: 'Forbidden: You can only delete your own account.' });
    }

    logger.info(`Deleting user with id: ${id}`);
    const result = await deleteUserService(id);

    res.json(result);
  } catch (e) {
    logger.error(e);
    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(e);
  }
};
