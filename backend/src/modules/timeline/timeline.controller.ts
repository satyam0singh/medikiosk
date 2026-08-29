import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TimelineService } from './timeline.service';
import { TimelineEventTypeSchema } from '@medikiosk/clinical-schema';
import { ApiResponse, TimelineEventType, ProvenanceType } from '@medikiosk/shared-types';

const CreateTimelineEventSchema = z.object({
  patientId: z.string().uuid(),
  encounterId: z.string().uuid().optional(),
  eventDate: z.string().min(4),
  isDateEstimated: z.boolean().optional().default(false),
  eventType: TimelineEventTypeSchema.default(TimelineEventType.CONSULTATION),
  title: z.string().min(1),
  description: z.string().optional(),
  sourceType: z.nativeEnum(ProvenanceType).optional().default(ProvenanceType.PATIENT_REPORTED),
  confidence: z.number().min(0).max(1).optional().default(1.0),
});

export class TimelineController {
  public static async getByPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await TimelineService.getByPatientId(req.params.patientId as string);
      const response: ApiResponse = {
        success: true,
        data: events,
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
      const events = await TimelineService.getByEncounterId(req.params.encounterId as string);
      const response: ApiResponse = {
        success: true,
        data: events,
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

  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = CreateTimelineEventSchema.parse(req.body);
      const event = await TimelineService.create(validated);

      const response: ApiResponse = {
        success: true,
        data: event,
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
}
