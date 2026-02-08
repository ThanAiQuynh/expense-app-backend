import express from 'express';
import * as controller from './controller.js';
import { authenticate } from '../../../core/middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticate, controller.getProfile);

export default router;