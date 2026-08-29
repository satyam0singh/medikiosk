import { Router } from 'express';
import { SummariesController } from './summaries.controller';

const router = Router();

router.post('/generate', SummariesController.generate);
router.post('/:encounterId/verify', SummariesController.verify);
router.get('/encounter/:encounterId', SummariesController.getByEncounter);

export const summaryRoutes = router;
