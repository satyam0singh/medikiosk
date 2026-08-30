import { Router } from 'express';
import { DoctorsController } from './doctors.controller';

const router = Router();

router.get('/', DoctorsController.list);
router.post('/', DoctorsController.create);
router.get('/:id', DoctorsController.getById);

export const doctorRoutes = router;
