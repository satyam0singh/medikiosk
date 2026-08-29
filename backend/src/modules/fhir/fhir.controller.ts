import { Request, Response, NextFunction } from 'express';
import { FhirService } from './fhir.service';
import { ApiResponse } from '@medikiosk/shared-types';

export class FhirController {
  public static async exportEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const encounterId = req.params.encounterId as string;
      const bundle = await FhirService.exportEncounter(encounterId);

      const response: ApiResponse = {
        success: true,
        data: bundle,
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
