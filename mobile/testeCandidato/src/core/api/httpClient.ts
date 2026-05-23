import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { env } from '../config/env';
import { getAuthToken } from '../shared/services/AuthTokenStore';
import { AppError, AppErrorKind } from './AppError';

/**
 * Single Axios instance for the whole app. We export the instance (not Axios
 * itself) so:
 *  - Consumers cannot accidentally create their own client and bypass our
 *    interceptors / auth / error handling.
 *  - Tests can swap this module via Jest manual mocks.
 *
 * Repositories depend on this client; use cases never see Axios — they only
 * see the repository interface defined in the domain layer.
 */

const mapStatusToKind = (status?: number): AppErrorKind => {
  if (status === undefined) return 'network';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
};

const buildClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: this is where auth tokens, telemetry headers, locale
  // and tracing IDs would be attached. Keeping it as a single hook means the
  // rest of the app stays unaware of cross-cutting concerns.
  // Response interceptor: normalize every failure into an AppError so callers
  // never have to deal with Axios specifics.
  client.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new AppError('timeout', 'Request timed out', undefined, error));
      }
      if (!error.response) {
        return Promise.reject(new AppError('network', 'Network unavailable', undefined, error));
      }
      const status = error.response.status;
      const kind = mapStatusToKind(status);
      const data = error.response.data as { message?: string } | undefined;
      const message = data?.message ?? error.message ?? 'Request failed';
      return Promise.reject(new AppError(kind, message, status, error));
    },
  );

  return client;
};

export const httpClient = buildClient();
export type HttpClient = typeof httpClient;
