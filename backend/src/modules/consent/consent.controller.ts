import { Request, Response, NextFunction } from 'express';
import { ConsentService } from './consent.service';
import { RecordConsentSchema } from '@medikiosk/clinical-schema';
import { ApiResponse } from '@medikiosk/shared-types';
import { AppError } from '../../middleware/errorHandler';

export class ConsentController {
  public static async recordConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = RecordConsentSchema.parse(req.body);
      const consent = await ConsentService.recordConsent({
        ...validated,
        ipAddress: req.ip,
      });

      const response: ApiResponse = {
        success: true,
        data: consent,
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

  public static async verifyConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const patientId = req.query.patientId as string;
      if (!patientId) {
        throw new AppError('Query parameter patientId is required', 400, 'MISSING_PATIENT_ID');
      }
      const scope = req.query.scope as string | undefined;
      const result = await ConsentService.verifyConsent(patientId, scope);

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

  public static async revokeConsent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const consentId = req.params.id as string;
      const consent = await ConsentService.revokeConsent(consentId, req.ip);

      const response: ApiResponse = {
        success: true,
        data: consent,
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
