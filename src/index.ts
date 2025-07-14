import "./alias"; // Configurar aliases de módulo primeiro
import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { useExpressServer } from "routing-controllers";

import { AppDataSource } from "./database/data-source";

import { RabbitMQService } from "./services/rabbitmqService";

import { AuditController } from "./controllers/auditController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, _, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Configurar routing-controllers
useExpressServer(app, {
  controllers: [AuditController],
  defaultErrorHandler: false,
});

// Handler de erro global
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", error);

    if (res.headersSent) {
      return next(error);
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
);

// Inicializar aplicação
async function startServer() {
  try {
    // Conectar ao banco de dados
    console.log("Connecting to database...");
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    // Conectar ao RabbitMQ
    console.log("Connecting to RabbitMQ...");
    await RabbitMQService.connect();

    // Subscribe to audit events from other services
    await RabbitMQService.subscribeToAuditEvents();
    console.log("RabbitMQ connected and subscribed to audit events");

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Audit Service running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/audit/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
