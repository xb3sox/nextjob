import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpStatusCode } from "@workspace/shared/constants";
import { HttpException } from "@workspace/shared/utils";

import { onError } from "../on-error";

import type { Context } from "hono";

vi.mock("@workspace/i18n/server", () => ({
  getTranslation: vi
    .fn<() => Promise<{ t: (key: string) => string; i18n: object }>>()
    .mockResolvedValue({
      t: (key: string) => key,
      i18n: {},
    }),
}));

vi.mock("@workspace/i18n", () => ({
  isKey: vi.fn<(key: string) => boolean>().mockReturnValue(true),
}));

vi.mock("@workspace/shared/utils", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@workspace/shared/utils")>();
  return {
    ...actual,
    getStatusCode: vi.fn<(error: unknown) => number>().mockReturnValue(500),
  };
});

vi.mock("@workspace/monitoring-web/server", () => ({
  captureException: vi.fn<(exception: unknown) => void>(),
}));

interface ErrorResponse {
  code: string;
  message: string;
  status: number;
  path: string;
  timestamp?: string;
}

const createContext = () =>
  ({
    req: { raw: { url: "http://localhost/api/test" } },
    var: { locale: "en" },
  }) as Context<{
    Variables: { locale: string };
  }>;

describe("onError", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {
      /* empty */
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a formatted error response for HttpException", async () => {
    const error = new HttpException(HttpStatusCode.INTERNAL_SERVER_ERROR, {
      code: "ERROR_CODE",
      message: "Something went wrong",
    });

    const response = await onError(error, createContext());

    const data = (await response.json()) as ErrorResponse;

    expect(data).toMatchObject({
      code: "ERROR_CODE",
      message: "Something went wrong",
      status: 500,
      path: "/api/test",
    });
    expect(data.timestamp).toBeDefined();
  });

  it("should translate error code if message is missing", async () => {
    const error = new HttpException(HttpStatusCode.BAD_REQUEST, {
      code: "auth.error.invalid_credentials",
      message: "",
    });

    const response = await onError(error, createContext());

    const data = (await response.json()) as ErrorResponse;

    expect(data.message).toBe("auth.error.invalid_credentials");
  });

  it("should fallback to general error if input is not HttpException", async () => {
    const error = "Just a string error";

    const response = await onError(error, createContext());

    const data = (await response.json()) as ErrorResponse;

    expect(data).toMatchObject({
      code: "common:error.general",
      message: "common:error.general",
      status: 500,
      path: "/api/test",
    });
  });

  it("should not expose unexpected Error messages to the client", async () => {
    const error = new Error(
      'Failed query: select * from "user" where id = $1 params: secret-user-id',
    );

    const response = await onError(error, createContext());

    const data = (await response.json()) as ErrorResponse;

    expect(data).toMatchObject({
      code: "common:error.general",
      message: "common:error.general",
      status: 500,
      path: "/api/test",
    });
    expect(data.message).not.toContain("select");
  });
});
