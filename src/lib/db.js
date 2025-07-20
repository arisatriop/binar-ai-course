import { Pool } from "pg";

let pool;

if (!global._pgPool) {
  global._pgPool = new Pool({
    user: process.env.PG_USER || "postgres",
    host: process.env.PG_HOST || "localhost",
    database: process.env.PG_DATABASE || "your_db",
    password: process.env.PG_PASSWORD || "your_password",
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432,
  });
}

pool = global._pgPool;

export default pool;
