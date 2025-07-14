import amqp from "amqplib";

import { AuditLogService } from "./auditLogService";

import { EventPayload, AuditEvent } from "@interfaces/rabbitmq";

export class RabbitMQService {
  private static connection: any = null;
  private static channel: any = null;
  private static auditLogService: AuditLogService = new AuditLogService();

  static async connect(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || "amqp://localhost";
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      const exchange = process.env.AUDIT_EXCHANGE || "audit.exchange";
      await this.channel.assertExchange(exchange, "direct", { durable: true });

      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  static async subscribeToAuditEvents(): Promise<void> {
    try {
      if (!this.channel) {
        throw new Error("RabbitMQ not connected");
      }

      const exchange = process.env.AUDIT_EXCHANGE || "audit.exchange";
      const queue = process.env.AUDIT_QUEUE || "audit.logs";
      const routingKey = process.env.AUDIT_ROUTING_KEY || "audit.*";

      await this.channel.assertQueue(queue, {
        durable: true,
        arguments: {
          "x-max-retries": 3,
          "x-message-ttl": 60000, // 1 minuto TTL para mensagens
        },
      });

      await this.channel.bindQueue(queue, exchange, routingKey);

      // Configurar prefetch para processar uma mensagem por vez
      await this.channel.prefetch(1);

      console.log(`Waiting for audit events in queue: ${queue}`);
      console.log(`Routing key: ${routingKey}`);

      await this.channel.consume(
        queue,
        async (msg: any) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              console.log("Received audit event:", {
                action: content.action,
                service: content.service,
                timestamp: content.timestamp,
              });

              // Processa o evento pra audit
              await this.processAuditEvent(content);

              this.channel.ack(msg);
              console.log("Audit event processed and acknowledged");
            } catch (error) {
              console.error("Error processing audit event:", error);

              if (error instanceof SyntaxError) {
                console.error("Invalid JSON format, rejecting message");
                this.channel.nack(msg, false, false);
              } else {
                console.error("Processing error, requeueing message");
                this.channel.nack(msg, false, true);
              }
            }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error("Failed to subscribe to audit events:", error);
      throw error;
    }
  }

  private static async processAuditEvent(
    event: EventPayload<AuditEvent>
  ): Promise<void> {
    try {
      console.log("Processing audit event:", {
        action: event.action,
        service: event.service,
        userId: event.metadata.userId,
      });

      // Extrair dados do evento
      const { action, service, metadata } = event;

      // Preparar metadata completa com informações adicionais
      const fullMetadata = {
        ...metadata,
        originalTimestamp: event.timestamp,
        processedAt: new Date().toISOString(),
      };

      // Salvar no banco de dados
      const auditLog = await this.auditLogService.createAuditLog({
        userId: event.metadata.userId,
        action,
        service,
        metadata: fullMetadata,
      });

      console.log("Audit log saved successfully:", {
        id: auditLog.id,
        action: auditLog.action,
        service: auditLog.service,
        userId: auditLog?.userId,
      });
    } catch (error) {
      console.error("Error processing audit event:", error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log("Disconnected from RabbitMQ");
    } catch (error) {
      console.error("Error disconnecting from RabbitMQ:", error);
    }
  }
}
