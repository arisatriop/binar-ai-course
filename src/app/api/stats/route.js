import pool from "@/lib/db";
import { NextResponse } from "next/server";
import "dotenv/config";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const status = searchParams.get("status");

  const whereClauses = [];
  const values = [];

  let i = 1;

  if (start) {
    whereClauses.push(`timestamp >= $${i++}`);
    values.push(start);
  }

  if (end) {
    whereClauses.push(`timestamp <= $${i++}`);
    values.push(end);
  }

  if (status) {
    if (status.endsWith("xx")) {
      const base = parseInt(status.slice(0, -2)) * 100;
      whereClauses.push(`status BETWEEN $${i++} AND $${i++}`);
      values.push(base);
      values.push(base + 99);
    } else {
      whereClauses.push(`status = $${i++}`);
      values.push(parseInt(status));
    }
  }

  const where =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status BETWEEN 200 AND 299) AS success,
        COUNT(*) FILTER (WHERE status BETWEEN 400 AND 499) AS clientError,
        COUNT(*) FILTER (WHERE status BETWEEN 500 AND 599) AS serverError
      FROM logs
      ${where}
      `,
      values
    );

    const stats = rows[0];

    return NextResponse.json({
      total: formatNumber(stats.total),
      success: formatNumber(stats.success),
      clientError: formatNumber(stats.clienterror),
      serverError: formatNumber(stats.servererror),
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

function formatNumber(value) {
  const number = parseInt(value);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)} m`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)} k`;
  return `${number}`;
}
