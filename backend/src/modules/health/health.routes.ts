import { Router } from 'express';
import { HealthController } from './health.controller';

const router = Router();

router.get('/', HealthController.getSystemHealth);
router.get('/database', HealthController.getDatabaseHealth);
router.get('/redis', HealthController.getRedisHealth);
router.get('/storage', HealthController.getStorageHealth);

export const healthRoutes = router;
