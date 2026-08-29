import { Router } from 'express';
import { AyushController } from './ayush.controller';

const router = Router();

router.post('/assess', AyushController.assessPrakriti);
router.get('/encounter/:encounterId', AyushController.getByEncounter);

export const ayushRoutes = router;
