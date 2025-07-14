import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAuditLogsTable1752357700000 implements MigrationInterface {
  name = "CreateAuditLogsTable1752357700000";

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
            length: "255",
          },
          {
            name: "action",
            type: "varchar",
            length: "100",
          },
          {
            name: "service",
            type: "varchar",
            length: "100",
          },
          {
            name: "metadata",
            type: "jsonb",
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("audit_logs");
  }
}
