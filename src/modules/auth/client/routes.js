import express from 'express';
import * as controller from './controller.js';
import validate from '../../../core/middleware/validationMiddleware.js';
import { loginSchema, registerSchema } from '../validator.js';

const router = express.Router();

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login)

export default router;