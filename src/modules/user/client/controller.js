import * as service from "../service.js";
import { toProfileResponseDTO } from "../dto.js";

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await service.getProfile(userId);
    res.status(200).json({
      success: true,
      data: toProfileResponseDTO({ user: data.user, role: data.role }),
    });
  } catch (error) {
    next(error);
  }
};
