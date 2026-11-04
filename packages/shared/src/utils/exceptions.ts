import { HttpStatusCode } from "../constants";

export const isHttpStatus = (status: number): status is HttpStatusCode =>
  Object.values<number>(HttpStatusCode).includes(status);

interface HttpExceptionOptions {
  message?: string;
  code?: string;
}

export class HttpException extends Error {
  readonly status?: HttpStatusCode;
  readonly code?: string;

  constructor(status?: HttpStatusCode, options?: HttpExceptionOptions) {
    super(options?.message);
    this.status = status;
    this.code = options?.code;
  }
}

const isValidHttpStatus = (status: number): boolean =>
  Number.isInteger(status) && status >= 200 && status <= 599;

export const getStatusCode = (e: unknown) => {
  if (typeof e === "object" && e !== null) {
    if (
      "statusCode" in e &&
      typeof e.statusCode === "number" &&
      isValidHttpStatus(e.statusCode)
    ) {
      return e.statusCode;
    }

    if ("status" in e) {
      const status = Number(e.status);
      if (isValidHttpStatus(status)) {
        return status;
      }
    }
  }

  return HttpStatusCode.INTERNAL_SERVER_ERROR;
};
