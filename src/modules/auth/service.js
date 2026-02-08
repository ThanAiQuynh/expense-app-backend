import { v4 as uuidv4 } from "uuid";
import * as repository from "./repository.js";
import {
  comparePassword,
  hashPassword,
} from "../../core/utils/passwordHelper.js";
import AppError from "../../core/utils/appError.js";
import { AUTH_MESSAGES, ROLES } from "./constants.js";
import db from "../../core/config/db.js";
import logger from "../../core/utils/logger.js";
import {
  signAccessToken,
  signRefreshToken,
} from "../../core/utils/jwtHelper.js";

export const register = async ({ email, password, fullName }) => {
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");
    logger.info(`Registration transaction started`, { email });

    const isExisted = await repository.existsByEmail(email, client);
    if (isExisted) {
      throw new AppError(AUTH_MESSAGES.EMAIL_ALREADY_EXIST, 400);
    }

    const defaultRole = await repository.findRoleByName(
      ROLES.DEFAULT_ROLE,
      client,
    );
    if (!defaultRole) {
      throw new AppError(AUTH_MESSAGES.DEFAULT_ROLE_NOT_FOUND, 500);
    }

    const passwordHash = await hashPassword(password);
    const newUser = await repository.create(
      {
        email,
        passwordHash,
        fullName,
      },
      client,
    );

    await repository.assignRole(
      { userId: newUser.id, roleId: defaultRole.id },
      client,
    );

    await client.query("COMMIT");
    logger.info(`Rgistration transaction committed`, { email });
    return newUser;
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Rgistration transaction failed", {
      email,
      error: error.message,
    });
    throw error;
  } finally {
    client.release();
  }
};

export const login = async ({ email, password, ipAddress, deviceInfo }) => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");
    logger.info("Login transaction started", { email });

    const user = await repository.findByEmail(email, client);
    if (!user) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const isMatchPassword = await comparePassword(password, user.password_hash);
    if (!isMatchPassword) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const jti = uuidv4();
    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken(user.id, jti);

    const expiresAt = new Date(Date.now() + Number(process.env.JWT_REFRESH_EXPIRES_MS));

    const session = await repository.createSession(
      {
        userId: user.id,
        jti,
        refreshToken,
        ipAddress,
        deviceInfo,
        expiresAt,
      },
      client,
    );

    if (!session) {
      throw new AppError(AUTH_MESSAGES.SESSION_CREATE_FAILED, 500);
    }

    await client.query("COMMIT");
    logger.info("Login transaction committed", { userId: user.id });

    return {
      user,
      accessToken,
      refreshToken,
      sessionId: session.id,
      expiresAt,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Login transaction failed", {
      email,
      error: error.message,
    });
    throw error;
  } finally {
    client.release();
  }
};
