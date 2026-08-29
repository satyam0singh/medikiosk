import { Router } from 'express';
import { FhirController } from './fhir.controller';

const router = Router();

router.post('/export/:encounterId', FhirController.exportEncounter);
router.get('/export/:encounterId', FhirController.exportEncounter);

export const fhirRoutes = router;
