import { Router } from 'express';
import { TimelineController } from './timeline.controller';

const router = Router();

router.get('/patient/:patientId', TimelineController.getByPatient);
router.get('/encounter/:encounterId', TimelineController.getByEncounter);
router.post('/events', TimelineController.create);

export const timelineRoutes = router;
