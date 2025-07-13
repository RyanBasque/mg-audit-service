export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  service: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreateAuditLogRequest {
  userId?: string;
  action: string;
  service: string;
  metadata?: Record<string, any>;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  service?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
