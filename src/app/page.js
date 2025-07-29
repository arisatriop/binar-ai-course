"use client";

import { useEffect, useState } from "react";
import {
  formatNumber,
  formatLatency,
  getLatencyBounds,
} from "@/utils/formatters";

export default function Page() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    clientError: 0,
    serverError: 0,
  });

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [latencyFilter, setLatencyFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(false);

  // Fetch logs
  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const { minLatency, maxLatency } = getLatencyBounds(latencyFilter);

        const query = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          ...(startDate && { start: startDate }),
          ...(endDate && { end: endDate }),
          ...(statusFilter && { status: statusFilter }),
          ...(minLatency !== undefined && { minLatency }),
          ...(maxLatency !== undefined && { maxLatency }),
        }).toString();

        const res = await fetch(`/api/logs?${query}`);
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Fetch logs error:", err);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
  }, [page, startDate, endDate, statusFilter, latencyFilter]);

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const { minLatency, maxLatency } = getLatencyBounds(latencyFilter);

        const query = new URLSearchParams({
          ...(startDate && { start: startDate }),
          ...(endDate && { end: endDate }),
          ...(statusFilter && { status: statusFilter }),
          ...(minLatency !== undefined && { minLatency }),
          ...(maxLatency !== undefined && { maxLatency }),
        }).toString();

        const res = await fetch(`/api/stats?${query}`);
        const data = await res.json();

        if (data?.total !== undefined) {
          setStats(data);
        }
      } catch (err) {
        console.error("Fetch stats error:", err);
      }
    }

    fetchStats();
  }, [startDate, endDate, statusFilter, latencyFilter]);

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Log Dashboard</h1>

      <div className="flex gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="start-date" className="text-sm text-gray-700 mb-1">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setPage(1);
              setStartDate(e.target.value);
            }}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="end-date" className="text-sm text-gray-700 mb-1">
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setPage(1);
              setEndDate(e.target.value);
            }}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="status-filter" className="text-sm text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            className="border p-2 rounded"
          >
            <option value="">All Status</option>
            <option value="2xx">2xx</option>
            <option value="4xx">4xx</option>
            <option value="5xx">5xx</option>
            <option value="200">200</option>
            <option value="401">401</option>
            <option value="403">403</option>
            <option value="404">404</option>
            <option value="500">500</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="latency-filter"
            className="text-sm text-gray-700 mb-1"
          >
            Latency
          </label>
          <select
            id="latency-filter"
            value={latencyFilter}
            onChange={(e) => {
              setLatencyFilter(e.target.value);
              setPage(1);
            }}
            className="border p-2 rounded"
          >
            <option value="">All</option>
            <option value="lt500">0 - 500 ms</option>
            <option value="gt500">&gt; 500 ms</option>
            <option value="gt1000">&gt; 1 s</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded shadow">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-xl font-bold">{formatNumber(stats.total)}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <p className="text-sm text-green-800">Success (2xx)</p>
          <p className="text-xl font-bold">{formatNumber(stats.success)}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <p className="text-sm text-yellow-800">Client Error (4xx)</p>
          <p className="text-xl font-bold">{formatNumber(stats.clientError)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          <p className="text-sm text-red-800">Server Error (5xx)</p>
          <p className="text-xl font-bold">{formatNumber(stats.serverError)}</p>
        </div>
      </div>

      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Timestamp</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Endpoint</th>
            <th className="p-2 border">Latency</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="4" className="p-4 text-center">
                Loading...
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-4 text-center text-gray-500">
                No logs found.
              </td>
            </tr>
          ) : (
            logs.map((log, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2 border">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="p-2 border">{log.status}</td>
                <td className="p-2 border">{log.endpoint}</td>
                <td className="p-2 border">{formatLatency(log.latency_ns)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-600">Page {page}</span>

        <div>
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="px-4 py-2 mr-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={handleNextPage}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
