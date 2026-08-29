import { Router } from 'express';
import { SafetyController } from './safety.controller';

const router = Router();

router.get('/', SafetyController.listAlerts);
router.post('/:id/acknowledge', SafetyController.acknowledgeAlert);

export const safetyRoutes = router;
