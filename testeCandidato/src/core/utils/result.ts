/**
 * A small Result<T> helper used by use cases to surface domain errors without
 * throwing. Exceptions are reserved for truly exceptional bugs; expected
 * failures (validation, missing data, auth) flow back as data via Result.
 *
 * Why not just throw?
 *  - Forces callers to handle both branches at the type level.
 *  - Keeps screens reactive (no try/catch noise inside UI hooks).
 */

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });
