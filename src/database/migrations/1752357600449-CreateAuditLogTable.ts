import { MigrationInterface, QueryRunner, Table, Index } from "typeorm";

export class CreateAuditLogTable1752357600449 implements MigrationInterface {
  name = "CreateAuditLogTable1752357600449";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "audit_logs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "userId",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "action",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "service",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "resource",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "resourceId",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "metadata",
            type: "jsonb",
            isNullable: true,
          },
          {
            name: "ipAddress",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "userAgent",
            type: "text",
            isNullable: true,
          },
          {
            name: "status",
            type: "enum",
            enum: ["success", "error", "warning"],
            default: "'success'",
          },
          {
            name: "errorMessage",
            type: "text",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create indexes for better query performance
    await queryRunner.createIndex(
      "audit_logs",
      new Index("IDX_AUDIT_USER_ACTION_DATE", ["userId", "action", "createdAt"])
    );

    await queryRunner.createIndex(
      "audit_logs",
      new Index("IDX_AUDIT_SERVICE_DATE", ["service", "createdAt"])
    );

    await queryRunner.createIndex(
      "audit_logs",
      new Index("IDX_AUDIT_STATUS", ["status"])
    );

    await queryRunner.createIndex(
      "audit_logs",
      new Index("IDX_AUDIT_CREATED_AT", ["createdAt"])
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("audit_logs");
  }
}
