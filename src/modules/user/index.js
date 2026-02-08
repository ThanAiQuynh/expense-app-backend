import express from 'express';
import userClientRoutes from './client/routes.js';

const router = express.Router();
router.use('/', userClientRoutes);

export default router;