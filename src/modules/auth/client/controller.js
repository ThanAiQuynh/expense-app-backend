import * as service from '../service.js';
import { AUTH_MESSAGES } from '../constants.js';
import { toUserResponseDTO } from '../dto.js';

export const register = async (req, res, next) => {
    try {
        const data = await service.register(req.body);

        return successResponse(
            res, 
            201, 
            AUTH_MESSAGES.REGISTER_SUCCESS, 
            toUserResponseDTO(data)
        );
    } catch (error) {
        return next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const data = await service.login(req.body);

        return successResponse(
            res, 
            200, 
            AUTH_MESSAGES.LOGIN_SUCCESS, 
            toUserResponseDTO(data)
        );
    } catch (error) {
        return next(error);
    }
}