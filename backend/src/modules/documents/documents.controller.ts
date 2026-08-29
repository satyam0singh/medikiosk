import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DocumentsService } from './documents.service';
import { DocumentTypeSchema } from '@medikiosk/clinical-schema';
import { ApiResponse, DocumentType } from '@medikiosk/shared-types';

const CreateDocumentSchema = z.object({
  patientId: z.string().uuid('Invalid patient UUID'),
  encounterId: z.string().uuid('Invalid encounter UUID'),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
  documentType: DocumentTypeSchema.default(DocumentType.OTHER),
  fileBase64: z.string().optional(),
});

export class DocumentsController {
  public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = CreateDocumentSchema.parse(req.body);
      const buffer = validated.fileBase64 ? Buffer.from(validated.fileBase64, 'base64') : undefined;

      const doc = await DocumentsService.create({
        patientId: validated.patientId,
        encounterId: validated.encounterId,
        fileName: validated.fileName,
        mimeType: validated.mimeType,
        fileSizeBytes: validated.fileSizeBytes,
        documentType: validated.documentType,
        fileBuffer: buffer,
      });

      const response: ApiResponse = {
        success: true,
        data: doc,
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
      const result = await DocumentsService.getById(req.params.id as string);
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

  public static async processDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const extraction = await DocumentsService.processDocument(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: extraction,
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

  public static async getExtraction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const extraction = await DocumentsService.getExtractionByDocumentId(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: extraction,
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

  public static async listByEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const documents = await DocumentsService.listByEncounter(req.params.encounterId as string);
      const response: ApiResponse = {
        success: true,
        data: documents,
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
