import * as repository from "./repository.js";
import AppError from "../../core/utils/appError.js";
import { USER_MESSAGES } from "./constants.js";

export const getProfile = async (userId) => {
  const profile = await repository.findById(userId);
  if(!profile) {
    throw new AppError(USER_MESSAGES.USER_NOT_FOUND, 500);
  }

  const roleName = await repository.findUserRoleName(userId);

  await repository.setLastLogin({ userId: userId }).catch(console.error);
  return {
    user: profile,
    role: roleName
  };
}