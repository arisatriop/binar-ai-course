import { NextResponse } from "next/server";
import pool from "@/lib/db"; // your shared db pool

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const offset = (page - 1) * pageSize;

  const startTimestamp = searchParams.get("start");
  const endTimestamp = searchParams.get("end");
  const status = searchParams.get("status");

  const minLatency = searchParams.get("minLatency");
  const maxLatency = searchParams.get("maxLatency");

  const whereClauses = [];
  const values = [pageSize, offset];
  let paramIndex = 3;

  if (startTimestamp) {
    whereClauses.push(`"timestamp" >= $${paramIndex++}`);
    values.push(startTimestamp);
  }

  if (endTimestamp) {
    whereClauses.push(`"timestamp" <= $${paramIndex++}`);
    values.push(endTimestamp);
  }

  if (status) {
    if (/^[1-5]xx$/.test(status)) {
      const statusGroup = parseInt(status[0]);
      const from = statusGroup * 100;
      const to = from + 99;
      whereClauses.push(`status BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
      values.push(from, to);
      paramIndex += 2;
    } else if (/^\d+$/.test(status)) {
      whereClauses.push(`status = $${paramIndex++}`);
      values.push(parseInt(status));
    } else {
      return NextResponse.json(
        { error: "Invalid status filter" },
        { status: 400 }
      );
    }
  }

  // Add latency filter (in nanoseconds)
  if (minLatency) {
    whereClauses.push(`latency_ns >= $${paramIndex++}`);
    values.push(Number(minLatency));
  }

  if (maxLatency) {
    whereClauses.push(`latency_ns <= $${paramIndex++}`);
    values.push(Number(maxLatency));
  }

  const whereClause = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  try {
    const result = await pool.query(
      `
      SELECT 
        "timestamp", 
        status, 
        endpoint, 
        latency_ns
      FROM logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2
      `,
      values
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err);
    return NextResponse.json({ error: "Failed to load logs" }, { status: 500 });
  }
}
