import { Request, Response, NextFunction } from 'express';
import { SessionsService } from './sessions.service';
import { CreateSessionSchema, RecordAnswerSchema } from '@medikiosk/clinical-schema';
import { ApiResponse } from '@medikiosk/shared-types';

export class SessionsController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = CreateSessionSchema.parse(req.body);
      const session = await SessionsService.create(validated);

      const response: ApiResponse = {
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SessionsService.getById(req.params.id as string);
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

  public static async recordAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.id as string;
      const validated = RecordAnswerSchema.parse({
        ...req.body,
        sessionId,
      });

      const result = await SessionsService.recordAnswer(sessionId, {
        questionId: validated.questionId,
        rawText: validated.rawText,
        selectedOptions: validated.selectedOptions,
        audioRecordId: validated.audioRecordId,
        confidence: validated.confidence,
        sourceType: validated.sourceType,
      });

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
