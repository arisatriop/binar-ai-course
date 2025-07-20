import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const minLatency = searchParams.get("minLatency");
  const maxLatency = searchParams.get("maxLatency");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  let conditions = [];
  let values = [];

  if (statusFilter === "2xx") {
    conditions.push("status BETWEEN 200 AND 299");
  } else if (statusFilter === "4xx") {
    conditions.push("status BETWEEN 400 AND 499");
  } else if (statusFilter === "5xx") {
    conditions.push("status BETWEEN 500 AND 599");
  } else if (statusFilter) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(Number(statusFilter));
  }

  if (minLatency) {
    conditions.push(`latency_ns >= $${values.length + 1}`);
    values.push(Number(minLatency));
  }

  if (maxLatency) {
    conditions.push(`latency_ns <= $${values.length + 1}`);
    values.push(Number(maxLatency));
  }

  if (start) {
    conditions.push(`timestamp >= $${values.length + 1}`);
    values.push(start);
  }

  if (end) {
    conditions.push(`timestamp <= $${values.length + 1}`);
    values.push(end);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const query = `
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status BETWEEN 200 AND 299) as success,
      COUNT(*) FILTER (WHERE status BETWEEN 400 AND 499) as clientError,
      COUNT(*) FILTER (WHERE status >= 500) as serverError
    FROM logs
    ${whereClause}
  `;

  const result = await pool.query(query, values);
  const stats = result.rows[0];

  return NextResponse.json({
    total: Number(stats.total),
    success: Number(stats.success),
    clientError: Number(stats.clienterror),
    serverError: Number(stats.servererror),
  });
}
