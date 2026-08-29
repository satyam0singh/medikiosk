import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SummariesService } from './summaries.service';
import { ApiResponse } from '@medikiosk/shared-types';

const GenerateSummarySchema = z.object({
  encounterId: z.string().uuid('Invalid encounter UUID'),
});

const VerifySummarySchema = z.object({
  physicianId: z.string().uuid('Invalid physician UUID').optional(),
  physicianName: z.string().optional(),
  clinicalNotes: z.string().optional(),
  editedFields: z.record(z.unknown()).optional(),
  provisionalDiagnosis: z.string().optional(),
  icd10Codes: z.array(z.string()).optional(),
  treatmentPlan: z.string().optional(),
});

export class SummariesController {
  public static async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = GenerateSummarySchema.parse(req.body);
      const summary = await SummariesService.generateSummary(validated.encounterId);

      const response: ApiResponse = {
        success: true,
        data: summary,
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

  public static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const encounterId = req.params.encounterId as string;
      const validated = VerifySummarySchema.parse(req.body);
      const physicianId = req.user ? req.user.userId : (validated.physicianId || 'a0000000-0000-0000-0000-000000000001');

      const result = await SummariesService.verifySummary(encounterId, {
        ...validated,
        physicianId,
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

  public static async getByEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await SummariesService.getByEncounter(req.params.encounterId as string);
      const response: ApiResponse = {
        success: true,
        data: summary,
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
