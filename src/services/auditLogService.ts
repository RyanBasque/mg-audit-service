import { AuditLogRepository } from "@repositories/AuditLogRepository";

import { AuditLog } from "@entities/AuditLog";

import { CreateAuditLogRequest, AuditLogFilter } from "@interfaces/audit";

export class AuditLogService {
  private auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  async createAuditLog(data: CreateAuditLogRequest): Promise<AuditLog> {
    return await this.auditLogRepository.create(data);
  }

  async getAuditLogs(filter: AuditLogFilter) {
    return await this.auditLogRepository.findByFilter(filter);
  }

  async getAuditLogById(id: string): Promise<AuditLog | null> {
    return await this.auditLogRepository.findById(id);
  }

  async logUserAction(
    userId: string,
    action: string,
    service: string,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    return await this.createAuditLog({
      userId,
      action,
      service,
      metadata,
    });
  }
}
