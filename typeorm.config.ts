import "reflect-metadata";

import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "audit_user",
  password: process.env.DB_PASSWORD || "audit_password",
  database: process.env.DB_NAME || "mg_audit_db",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  entities: ["src/entities/*.ts"],
  migrations: ["src/database/migrations/*.ts"],
  subscribers: ["src/database/subscribers/*.ts"],
});
