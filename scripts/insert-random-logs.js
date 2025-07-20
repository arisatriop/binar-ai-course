const { Pool } = require("pg");
require("dotenv").config(); // load .env

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const endpoints = [
  "/api/user",
  "/api/product",
  "/api/order",
  "/api/login",
  "/api/logout",
];
const statuses = [200, 201, 400, 401, 403, 404, 500, 502];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomLatencyNs() {
  // Between 100ns and 5s (in nanoseconds)
  return Math.floor(Math.random() * (5e9 - 100)) + 100;
}

function getRandomTimestamp() {
  const now = Date.now();
  const past = now - 1000 * 60 * 60 * 24 * 30; // 30 days ago
  return new Date(past + Math.random() * (now - past));
}

async function insertLogs() {
  const client = await pool.connect();
  try {
    const batchSize = 1000;
    const total = 100000;
    for (let i = 0; i < total; i += batchSize) {
      const values = [];
      for (let j = 0; j < batchSize; j++) {
        const timestamp = getRandomTimestamp().toISOString();
        const status = getRandomElement(statuses);
        const endpoint = getRandomElement(endpoints);
        const latency_ns = getRandomLatencyNs();
        values.push(
          `('${timestamp}', ${status}, '${endpoint}', ${latency_ns})`
        );
      }

      const insertQuery = `
        INSERT INTO logs ("timestamp", status, endpoint, latency_ns)
        VALUES ${values.join(", ")}
      `;
      await client.query(insertQuery);
      console.log(`Inserted ${i + batchSize} rows...`);
    }
    console.log("✅ Done inserting 10,000 rows!");
  } catch (err) {
    console.error("❌ Error inserting logs:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

insertLogs();
