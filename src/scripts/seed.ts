import "reflect-metadata";
import { AppDataSource } from "@database/data-source";
import { AuditLogService } from "@services/auditLogService";

async function runSeed() {
  try {
    console.log("Initializing database connection...");
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const auditLogService = new AuditLogService();

    // Create sample audit logs
    const sampleLogs = [
      {
        userId: "sample-user-1",
        action: "login",
        service: "mg-login-service",
        resource: "auth",
        metadata: { ip: "192.168.1.1", browser: "Chrome" },
        status: "success" as const,
      },
      {
        userId: "sample-user-2",
        action: "logout",
        service: "mg-login-service",
        resource: "auth",
        metadata: { sessionDuration: "2h 15m" },
        status: "success" as const,
      },
      {
        action: "failed_login",
        service: "mg-login-service",
        resource: "auth",
        metadata: { ip: "192.168.1.100", reason: "invalid_credentials" },
        status: "error" as const,
        errorMessage: "Invalid username or password",
      },
      {
        userId: "sample-user-1",
        action: "data_export",
        service: "mg-data-service",
        resource: "user_data",
        resourceId: "export-123",
        metadata: { format: "csv", recordCount: 1500 },
        status: "success" as const,
      },
    ];

    console.log("Creating sample audit logs...");
    for (const logData of sampleLogs) {
      await auditLogService.createAuditLog(logData);
      console.log(`Created audit log: ${logData.action}`);
    }

    console.log("✅ Seed completed successfully!");
    console.log(`Created ${sampleLogs.length} sample audit logs`);
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

runSeed();
