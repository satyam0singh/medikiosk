import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AyushService } from './ayush.service';
import { ApiResponse } from '@medikiosk/shared-types';

const ComputePrakritiSchema = z.object({
  encounterId: z.string().uuid(),
  patientId: z.string().uuid(),
  vataAnswers: z.number().int().min(0).default(0),
  pittaAnswers: z.number().int().min(0).default(0),
  kaphaAnswers: z.number().int().min(0).default(0),
  agniType: z.enum(['MANDA', 'TIKSHNA', 'VISHAMA', 'SAMA']).optional(),
  bowelHabits: z.string().optional(),
  dietaryHabits: z.string().optional(),
  sleepPattern: z.string().optional(),
});

export class AyushController {
  public static async assessPrakriti(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = ComputePrakritiSchema.parse(req.body);
      const assessment = await AyushService.assessPrakriti(validated);

      const response: ApiResponse = {
        success: true,
        data: assessment,
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

  public static async getByEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const assessment = await AyushService.getByEncounter(req.params.encounterId as string);
      const response: ApiResponse = {
        success: true,
        data: assessment,
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
