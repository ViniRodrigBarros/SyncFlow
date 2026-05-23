/**
 * Domain-friendly error type. The whole app should only ever deal with this
 * shape — never raw AxiosError. The API interceptor maps HTTP/network errors
 * into AppError so screens, use cases and repositories don't need to know
 * about transport details.
 */

export type AppErrorKind =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'server'
  | 'unknown';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status?: number;
  readonly cause?: unknown;

  constructor(kind: AppErrorKind, message: string, status?: number, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.kind = kind;
    this.status = status;
    this.cause = cause;
  }

  static from(unknownError: unknown): AppError {
    if (unknownError instanceof AppError) return unknownError;
    if (unknownError instanceof Error) {
      return new AppError('unknown', unknownError.message, undefined, unknownError);
    }
    return new AppError('unknown', 'Unexpected error', undefined, unknownError);
  }
}
