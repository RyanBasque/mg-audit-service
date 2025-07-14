export interface EventPayload<T = Record<string, any>> {
  action: string;
  timestamp: string;
  service: string;
  metadata: Record<string, any>;
}

export interface AuditEvent {
  userId?: string;
  action: string;
  service: string;
  metadata?: Record<string, any>;
}
