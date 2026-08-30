import { Router } from 'express';
import { EncountersController } from './encounters.controller';

const router = Router();

router.get('/queue', EncountersController.getQueue);
router.post('/', EncountersController.create);
router.get('/:id', EncountersController.getById);
router.get('/:id/clinical-briefing', EncountersController.getClinicalBriefing);
router.patch('/:id/status', EncountersController.updateStatus);
router.patch('/:id/reassign', EncountersController.reassign);
router.get('/patient/:patientId', EncountersController.listByPatient);

export const encounterRoutes = router;
