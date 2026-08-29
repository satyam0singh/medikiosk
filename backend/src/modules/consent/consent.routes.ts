import { Router } from 'express';
import { ConsentController } from './consent.controller';

const router = Router();

router.post('/', ConsentController.recordConsent);
router.get('/verify', ConsentController.verifyConsent);
router.post('/:id/revoke', ConsentController.revokeConsent);

export const consentRoutes = router;
