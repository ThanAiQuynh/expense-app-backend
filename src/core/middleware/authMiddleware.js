import { verifyToken } from '../utils/jwtHelper.js';
import AppError from '../utils/appError.js';
import * as userRepository from '../../modules/users/user.repository.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('You are not logged in. Please log in to continue.', 401);
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify Access Token
        const decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET);

        // 3. Check if user still exists (in case user was deleted after token issuance)
        const currentUser = await userRepository.findById(decoded.sub);

        if (!currentUser) {
            throw new AppError('The user associated with this token no longer exists.', 401);
        }

        // 4. Attach user info to request for downstream controllers
        req.user = currentUser;
        next();
    } catch (error) {
        next(error);
    }
};
