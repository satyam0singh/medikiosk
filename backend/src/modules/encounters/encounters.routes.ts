import { Router } from 'express';
import { EncountersController } from './encounters.controller';

const router = Router();

router.post('/', EncountersController.create);
router.get('/:id', EncountersController.getById);
router.patch('/:id/status', EncountersController.updateStatus);
router.get('/patient/:patientId', EncountersController.listByPatient);

export const encounterRoutes = router;
