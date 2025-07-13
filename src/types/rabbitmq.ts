export interface EventPayload<T = Record<string, any>> {
  action: string;
  timestamp: string;
  service: string;
  data: T;
}

export interface AuditEvent {
  userId?: string;
  action: string;
  service: string;
  metadata?: Record<string, any>;
}
