import express from 'express';
import * as authController from './controller.js';
import validate from '../../../core/middleware/validationMiddleware.js';
import { registerSchema } from '../validator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);


export default router;