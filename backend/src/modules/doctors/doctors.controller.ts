import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DoctorsService } from './doctors.service';
import { ApiResponse, UserRole } from '@medikiosk/shared-types';

const CreateDoctorSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(2, 'Department is required'),
  specialtyTitle: z.string().optional(),
  roomNumber: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export class DoctorsController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const department = req.query.department as string | undefined;
      const doctors = await DoctorsService.listAll(department);

      const response: ApiResponse = {
        success: true,
        data: doctors,
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
      const validated = CreateDoctorSchema.parse(req.body);
      const doctor = await DoctorsService.create(validated);

      const response: ApiResponse = {
        success: true,
        data: doctor,
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
      const doctor = await DoctorsService.getById(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: doctor,
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
