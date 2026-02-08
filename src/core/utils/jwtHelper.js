import jwt from 'jsonwebtoken';
import AppError from './appError.js';

/**
 * Tạo Access Token (Thường hết hạn sau 15p - 1h)
 */
export const signAccessToken = (userId) => {
    return jwt.sign(
        { sub: userId }, 
        process.env.JWT_ACCESS_SECRET, 
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_MS || '15m' }
    );
};

/**
 * Tạo Refresh Token kèm theo JTI (Dùng để lưu vào DB user_sessions)
 * @param {string} userId 
 * @param {string} jti - Unique ID của phiên làm việc
 */
export const signRefreshToken = (userId, jti) => {
    return jwt.sign(
        { sub: userId, jti }, 
        process.env.JWT_REFRESH_SECRET, 
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_MS || '30d' }
    );
};

/**
 * Xác thực Token
 * @param {string} token 
 * @param {string} secret - JWT_ACCESS_SECRET hoặc JWT_REFRESH_SECRET
 */
export const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AppError('Token has expired, please log in again', 401);
        }
        throw new AppError('Invalid token', 401);
    }
};
