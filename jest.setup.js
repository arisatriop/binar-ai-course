import "@testing-library/jest-dom";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: "",
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables
process.env.PG_USER = "test_user";
process.env.PG_HOST = "localhost";
process.env.PG_DATABASE = "test_db";
process.env.PG_PASSWORD = "test_password";
process.env.PG_PORT = "5432";
