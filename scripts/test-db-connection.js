import { Pool } from "pg";
import "dotenv/config"; // make sure to load .env

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW() AS current_time");
    console.log("✅ Connected to database!");
    console.log("🕒 Current time:", res.rows[0].current_time);
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
  } finally {
    await pool.end(); // always clean up
  }
}

testConnection();
