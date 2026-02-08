import * as service from "../service.js";
import { AUTH_MESSAGES } from "../constants.js";
import { toLoginResponseDTO, toUserDTO } from "../dto.js";
import { successResponse } from "../../../core/utils/responseHelper.js";

export const register = async (req, res, next) => {
  try {
    const data = await service.register(req.body);
    return successResponse(
      res,
      201,
      AUTH_MESSAGES.REGISTER_SUCCESS,
      toUserDTO(data),
    );
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await service.login({
      email,
      password,
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      deviceInfo: req.headers["user-agent"] || "Unknown",
    });

    return successResponse(
      res,
      200,
      AUTH_MESSAGES.LOGIN_SUCCESS,
      toLoginResponseDTO(data),
    );
  } catch (error) {
    return next(error);
  }
};
