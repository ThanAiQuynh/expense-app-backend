import * as authService from '../service.js';
import { AUTH_MESSAGES } from '../constants.js';
import { toUserResponseDTO } from '../dto.js';

export const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);

        res.status(201).json({
            success: true,
            message: AUTH_MESSAGES.REGISTER_SUCCESS,
            data: toUserResponseDTO(user)
        });
    } catch (error) {
        next(error);
    }
};