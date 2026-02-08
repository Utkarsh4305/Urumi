import { Router } from 'express';
import storeRoutes from './store.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/stores', storeRoutes);
router.use('/health', healthRoutes);

export default router;
