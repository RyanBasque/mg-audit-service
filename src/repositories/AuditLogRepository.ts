import { Repository } from "typeorm";

import { AppDataSource } from "@database/data-source";

import { AuditLog } from "@entities/AuditLog";

import { AuditLogFilter } from "@interfaces/audit";

export class AuditLogRepository {
  private repository: Repository<AuditLog>;

  constructor() {
    this.repository = AppDataSource.getRepository(AuditLog);
  }

  async create(auditLogData: Partial<AuditLog>): Promise<AuditLog> {
    const auditLog = this.repository.create(auditLogData);
    return await this.repository.save(auditLog);
  }

  async findByFilter(filter: AuditLogFilter): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      userId,
      action,
      service,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filter;

    const query = this.repository.createQueryBuilder("audit_log");

    if (userId) {
      query.andWhere("audit_log.userId = :userId", { userId });
    }

    if (action) {
      query.andWhere("audit_log.action = :action", { action });
    }

    if (service) {
      query.andWhere("audit_log.service = :service", { service });
    }

    if (startDate) {
      query.andWhere("audit_log.createdAt >= :startDate", { startDate });
    }

    if (endDate) {
      query.andWhere("audit_log.createdAt <= :endDate", { endDate });
    }

    query.orderBy("audit_log.createdAt", "DESC");

    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<AuditLog | null> {
    return await this.repository.findOne({ where: { id } });
  }
}
