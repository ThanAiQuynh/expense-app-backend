import * as userRepository from './repository.js';
import { hashPassword } from '../../core/utils/passwordHelper.js';
import AppError from '../../core/utils/appError.js';
import { AUTH_MESSAGES } from './constants.js';

export const register = async ({ email, password, fullName }) => {
    const isExisted = await userRepository.existsByEmail(email);
    if (isExisted) {
        throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_EXIST, 400);
    }
    const passwordHash = await hashPassword(password);
    const newUser = await userRepository.create({ 
        email, 
        passwordHash, 
        fullName 
    });

    return newUser;
};