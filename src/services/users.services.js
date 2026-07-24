import logger from '#config/logger';
import { db } from '#config/database';
import { users } from '#models/user.model';
import { eq } from 'drizzle-orm';
import { hashPassword } from '#services/auth.service';

export const getAllUsers = async () => {
  try {
    const allUsers = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users);

    return allUsers;
  } catch (e) {
    logger.error(`Error fetching all users: ${e}`);
    throw e;
  }               
};

export const getUserById = async (id) => {
  try {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, id)).limit(1);

    return user;
  } catch (e) {
    logger.error(`Error fetching user by id ${id}: ${e}`);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updateData = { ...updates, updatedAt: new Date() };

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    return updatedUser;
  } catch (e) {
    logger.error(`Error updating user ${id}: ${e}`);
    throw e;
  }
};

export const deleteUser = async (id) => {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existingUser) {
      throw new Error('User not found');
    }

    await db.delete(users).where(eq(users.id, id));
    return { message: 'User deleted successfully' };
  } catch (e) {
    logger.error(`Error deleting user ${id}: ${e}`);
    throw e;
  }
};