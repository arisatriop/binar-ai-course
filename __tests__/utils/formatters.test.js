/**
 * @jest-environment jsdom
 */
import {
  formatNumber,
  formatLatency,
  getLatencyBounds,
} from "../../src/utils/formatters";

describe("formatNumber", () => {
  test("formats numbers less than 1000", () => {
    expect(formatNumber("500")).toBe("500");
    expect(formatNumber("999")).toBe("999");
    expect(formatNumber("0")).toBe("0");
  });

  test("formats numbers in thousands", () => {
    expect(formatNumber("1000")).toBe("1.0 k");
    expect(formatNumber("1500")).toBe("1.5 k");
    expect(formatNumber("10000")).toBe("10.0 k");
    expect(formatNumber("999999")).toBe("1000.0 k");
  });

  test("formats numbers in millions", () => {
    expect(formatNumber("1000000")).toBe("1.0 m");
    expect(formatNumber("1500000")).toBe("1.5 m");
    expect(formatNumber("10000000")).toBe("10.0 m");
  });

  test("handles string inputs", () => {
    expect(formatNumber("1234")).toBe("1.2 k");
    expect(formatNumber("1234567")).toBe("1.2 m");
  });
});

describe("formatLatency", () => {
  test("handles null values", () => {
    expect(formatLatency(null)).toBe("-");
  });

  test("formats microseconds", () => {
    expect(formatLatency(500000)).toBe("500.00 µs"); // 0.5 ms
    expect(formatLatency(999999)).toBe("1000.00 µs"); // 0.999 ms
  });

  test("formats milliseconds", () => {
    expect(formatLatency(1000000)).toBe("1.00 ms"); // 1 ms
    expect(formatLatency(500000000)).toBe("500.00 ms"); // 500 ms
    expect(formatLatency(999000000)).toBe("999.00 ms"); // 999 ms
  });

  test("formats seconds", () => {
    expect(formatLatency(1000000000)).toBe("1.00 s"); // 1 second
    expect(formatLatency(5000000000)).toBe("5.00 s"); // 5 seconds
  });

  test("handles zero latency", () => {
    expect(formatLatency(0)).toBe("0.00 µs");
  });
});

describe("getLatencyBounds", () => {
  test("returns bounds for lt500 filter", () => {
    const result = getLatencyBounds("lt500");
    expect(result).toEqual({
      minLatency: 0,
      maxLatency: 500000000, // 500ms in nanoseconds
    });
  });

  test("returns bounds for gt500 filter", () => {
    const result = getLatencyBounds("gt500");
    expect(result).toEqual({
      minLatency: 500000000, // 500ms in nanoseconds
      maxLatency: undefined,
    });
  });

  test("returns bounds for gt1000 filter", () => {
    const result = getLatencyBounds("gt1000");
    expect(result).toEqual({
      minLatency: 1000000000, // 1000ms in nanoseconds
      maxLatency: undefined,
    });
  });

  test("returns undefined bounds for unknown filter", () => {
    const result = getLatencyBounds("unknown");
    expect(result).toEqual({
      minLatency: undefined,
      maxLatency: undefined,
    });
  });

  test("returns undefined bounds for empty filter", () => {
    const result = getLatencyBounds("");
    expect(result).toEqual({
      minLatency: undefined,
      maxLatency: undefined,
    });
  });
});
