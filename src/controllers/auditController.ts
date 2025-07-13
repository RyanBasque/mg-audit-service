import { Request, Response } from "express";
import {
  JsonController,
  Post,
  Get,
  Body,
  Res,
  Req,
  QueryParams,
  Param,
  HeaderParam,
} from "routing-controllers";

import { AuditLogService } from "@services/auditLogService";
import { JwtService } from "@services/jwtService";
import { CreateAuditLogRequest, AuditLogFilter } from "@interfaces/audit";

@JsonController("/audit")
export class AuditController {
  private auditLogService: AuditLogService;

  constructor() {
    this.auditLogService = new AuditLogService();
  }

  @Post("/logs")
  async createAuditLog(
    @Body() auditData: CreateAuditLogRequest,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const metadata = {
        ...auditData.metadata,
        requestId: req.headers["x-request-id"],
        timestamp: new Date().toISOString(),
      };

      const auditLogData: CreateAuditLogRequest = {
        ...auditData,
        userId: auditData.userId,
        metadata,
      };

      const auditLog = await this.auditLogService.createAuditLog(auditLogData);

      return res.status(201).json({
        success: true,
        message: "Audit log created successfully",
        data: auditLog,
      });
    } catch (error: any) {
      console.error("Error creating audit log:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create audit log",
        error: error.message,
      });
    }
  }

  @Get("/logs")
  async getAuditLogs(
    @QueryParams() filter: AuditLogFilter,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const result = await this.auditLogService.getAuditLogs(filter);

      return res.status(200).json({
        success: true,
        message: "Audit logs retrieved successfully",
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error: any) {
      console.error("Error retrieving audit logs:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve audit logs",
        error: error.message,
      });
    }
  }

  @Get("/logs/:id")
  async getAuditLogById(
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const auditLog = await this.auditLogService.getAuditLogById(id);

      if (!auditLog) {
        return res.status(404).json({
          success: false,
          message: "Audit log not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Audit log retrieved successfully",
        data: auditLog,
      });
    } catch (error: any) {
      console.error("Error retrieving audit log:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve audit log",
        error: error.message,
      });
    }
  }

  @Get("/health")
  async health(@Res() res: Response): Promise<Response> {
    return res.status(200).json({
      success: true,
      message: "Audit Service is healthy",
      timestamp: new Date().toISOString(),
      service: "mg-audit-service",
    });
  }
}
