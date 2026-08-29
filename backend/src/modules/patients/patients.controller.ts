import { Request, Response, NextFunction } from 'express';
import { PatientsService } from './patients.service';
import { CreatePatientSchema } from '@medikiosk/clinical-schema';
import { ApiResponse } from '@medikiosk/shared-types';

export class PatientsController {
  public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const patients = await PatientsService.search(q);

      const response: ApiResponse = {
        success: true,
        data: patients,
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

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patient = await PatientsService.getById(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: patient,
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
      const validated = CreatePatientSchema.parse(req.body);
      const patient = await PatientsService.create(validated);

      const response: ApiResponse = {
        success: true,
        data: patient,
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

  public static async getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeline = await PatientsService.getTimeline(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: timeline,
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
