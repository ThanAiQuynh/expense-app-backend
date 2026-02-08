import * as repository from './repository.js';
import { comparePassword, hashPassword } from '../../core/utils/passwordHelper.js';
import AppError from '../../core/utils/appError.js';
import { AUTH_MESSAGES, ROLES } from './constants.js';
import db from '../../core/config/db.js';
import logger from '../../core/utils/logger.js';

export const register = async ({ email, password, fullName }) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        logger.info(`Transaction started for user registration: ${email}`);

        const isExisted = await repository.existsByEmail(email, client);
        if (isExisted) {
            throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_EXIST, 400);
        }

        const defaultRole = await repository.findRoleByName(ROLES.DEFAULT_ROLE, client);
        if (!defaultRole) {
            throw new AppError(AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND, 500);
        }

        const passwordHash = await hashPassword(password);
        const newUser = await repository.create({
            email,
            passwordHash,
            fullName
        }, client);

        await repository.assignRole({ userId: newUser.id, roleId: defaultRole.id }, client);

        await client.query('COMMIT');
        logger.info(`Transaction committed for user: ${email}`);

        return newUser;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Transaction failed for user ${email}: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
};

export const login = async ({ email, password }) => {
    const user = await repository.findByEmail(email);
    if (!user) {
        throw new AppError(AUTH_MESSAGES.EMAIL_NOT_FOUND, 401);
    }
    const isMatchPassword = await comparePassword(password, user.password_hash);
    if (!isMatchPassword) {
        throw new AppError(AUTH_MESSAGES.PASSWORD_MISMATCH, 401);
    }

}