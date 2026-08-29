import { Router } from 'express';
import { PatientsController } from './patients.controller';

const router = Router();

router.get('/search', PatientsController.search);
router.get('/:id', PatientsController.getById);
router.post('/', PatientsController.create);
router.get('/:id/timeline', PatientsController.getTimeline);

export const patientRoutes = router;
