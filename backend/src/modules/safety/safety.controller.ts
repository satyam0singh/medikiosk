import { Request, Response, NextFunction } from 'express';
import { SafetyService } from './safety.service';
import { ApiResponse } from '@medikiosk/shared-types';

export class SafetyController {
  public static async listAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAck = req.query.isAcknowledged !== undefined
        ? req.query.isAcknowledged === 'true'
        : undefined;

      const alerts = await SafetyService.listAlerts(isAck);
      const response: ApiResponse = {
        success: true,
        data: alerts,
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

  public static async acknowledgeAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alertId = req.params.id as string;
      const userId = req.user ? req.user.userId : 'a0000000-0000-0000-0000-000000000002'; // default to triage user if unauth in demo
      const alert = await SafetyService.acknowledgeAlert(alertId, userId);

      const response: ApiResponse = {
        success: true,
        data: alert,
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
