import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { EncountersService } from './encounters.service';
import { EncounterStatusSchema } from '@medikiosk/clinical-schema';
import { ApiResponse } from '@medikiosk/shared-types';

const CreateEncounterSchema = z.object({
  patientId: z.string().uuid('Invalid patient UUID'),
  physicianId: z.string().uuid('Invalid physician UUID').optional(),
  department: z.string().default('General Medicine'),
  encounterType: z.enum(['OPD_GENERAL', 'OPD_AYUSH', 'EMERGENCY', 'TELECONSULT']).default('OPD_GENERAL'),
  chiefComplaintSummary: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  status: EncounterStatusSchema,
  physicianId: z.string().uuid().optional(),
});

export class EncountersController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = CreateEncounterSchema.parse(req.body);
      const encounter = await EncountersService.create(validated);

      const response: ApiResponse = {
        success: true,
        data: encounter,
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
      const encounter = await EncountersService.getById(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: encounter,
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

  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, physicianId } = UpdateStatusSchema.parse(req.body);
      const encounter = await EncountersService.updateStatus(req.params.id as string, status, physicianId);

      const response: ApiResponse = {
        success: true,
        data: encounter,
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

  public static async listByPatient(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.params.patientId as string;
      const encounters = await EncountersService.listByPatient(patientId);

      const response: ApiResponse = {
        success: true,
        data: encounters,
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
