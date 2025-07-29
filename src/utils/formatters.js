export function formatNumber(value) {
  const number = parseInt(value);
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)} m`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)} k`;
  return `${number}`;
}

export function formatLatency(nanoseconds) {
  if (nanoseconds === null) return "-";
  const ms = nanoseconds / 1e6;
  if (ms < 1) return `${(ms * 1000).toFixed(2)} µs`;
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function getLatencyBounds(latencyFilter) {
  let minLatency, maxLatency;

  if (latencyFilter === "lt500") {
    minLatency = 0;
    maxLatency = 500 * 1e6; // 500 ms to ns
  } else if (latencyFilter === "gt500") {
    minLatency = 500 * 1e6; // > 500 ms
  } else if (latencyFilter === "gt1000") {
    minLatency = 1000 * 1e6; // > 1 s
  }

  return { minLatency, maxLatency };
}
