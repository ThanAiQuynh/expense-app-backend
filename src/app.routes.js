import express from 'express';
import authModule from './modules/auth/index.js';
import userModule from './modules/user/index.js'

const router = express.Router();

router.use('/auth', authModule);
router.use('/user', userModule);

export default router;