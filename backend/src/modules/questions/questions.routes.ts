import { Router } from 'express';
import { QuestionsController } from './questions.controller';

const router = Router();

router.get('/', QuestionsController.getAllQuestions);
router.get('/next', QuestionsController.getNextQuestion);

export const questionRoutes = router;
