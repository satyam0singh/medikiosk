import { Request, Response, NextFunction } from 'express';
import { QuestionsService } from './questions.service';
import { ApiResponse } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export class QuestionsController {
  public static async getAllQuestions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const questions = await QuestionsService.getAllQuestions();
      const response: ApiResponse = {
        success: true,
        data: questions,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async getNextQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.query.sessionId as string;
      if (!sessionId) {
        throw new AppError('sessionId query parameter is required', 400, 'MISSING_SESSION_ID');
      }

      const result = await QuestionsService.getNextQuestion(sessionId);
      const response: ApiResponse = {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
