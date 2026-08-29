import { Router } from 'express';
import { DocumentsController } from './documents.controller';

const router = Router();

router.post('/', DocumentsController.create);
router.get('/:id', DocumentsController.getById);
router.post('/:id/process', DocumentsController.processDocument);
router.get('/:id/extraction', DocumentsController.getExtraction);
router.get('/encounter/:encounterId', DocumentsController.listByEncounter);

export const documentRoutes = router;
