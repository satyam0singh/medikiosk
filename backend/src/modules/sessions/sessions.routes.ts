import { Router } from 'express';
import { SessionsController } from './sessions.controller';

const router = Router();

router.post('/', SessionsController.create);
router.get('/:id', SessionsController.getById);
router.post('/:id/answers', SessionsController.recordAnswer);

export const sessionRoutes = router;
