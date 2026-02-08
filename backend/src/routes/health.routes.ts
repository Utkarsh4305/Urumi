import { Router } from 'express';
import healthController from '../controllers/health.controller';

const router = Router();

// Health check
router.get('/', (req, res, next) => healthController.checkHealth(req, res, next));

export default router;
