import express from 'express';
import authClientRoutes from './client/routes.js';

const router = express.Router();
router.use('/', authClientRoutes);

export default router;