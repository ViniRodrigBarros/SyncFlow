import { httpClient, AppError } from '../../../api';
import { setAuthToken } from '../../services/AuthTokenStore';
import { logger } from '../../../utils/logger';
import type {
  Credentials,
  LoginResult,
  RegisterInput,
  RegisterResult,
} from '../../data/entities/authEntities';
import {
  AUTH_ROUTES,
  buildAuthUrl,
  AuthMapper,
  type LoginRequestDto,
  type LoginResponseDto,
  type RegisterRequestDto,
  type RegisterResponseDto,
} from '../../data/dtos/authDto';

export class AuthRepository {
  async signIn(input: Credentials): Promise<LoginResult> {
    const payload: LoginRequestDto = {
      identificador: input.email,
      senha: input.password,
    };
    const url = buildAuthUrl(AUTH_ROUTES.signIn);
    logger.debug('AuthRepository.signIn → request', {
      url,
      payload: { identificador: payload.identificador, senha: '***' },
    });

    try {
      const response = await httpClient.post<LoginResponseDto>(url, payload);
      logger.debug('AuthRepository.signIn ← response', {
        status: response.status,
        data: response.data,
      });

      setAuthToken(response.data.access_token);
      return AuthMapper.loginToDomain(response.data);
    } catch (error) {
      const appError = AppError.from(error);
      const cause = appError.cause as
        | { response?: { status?: number; data?: unknown }; config?: { url?: string } }
        | undefined;
      logger.error('AuthRepository.signIn ✖ error', {
        kind: appError.kind,
        status: appError.status,
        message: appError.message,
        responseBody: cause?.response?.data,
        url: cause?.config?.url,
      });
      throw appError;
    }
  }

  async register(input: RegisterInput): Promise<RegisterResult> {
    const payload: RegisterRequestDto = {
      nome: input.name,
      email: input.email,
      senha: input.password,
    };
    const url = buildAuthUrl(AUTH_ROUTES.register);
    logger.debug('AuthRepository.register → request', {
      url,
      payload: { nome: payload.nome, email: payload.email, senha: '***' },
    });

    try {
      const response = await httpClient.post<RegisterResponseDto>(url, payload);
      logger.debug('AuthRepository.register ← response', {
        status: response.status,
        data: response.data,
      });

      if (response.data.access_token) setAuthToken(response.data.access_token);
      return AuthMapper.registerToDomain(response.data);
    } catch (error) {
      const appError = AppError.from(error);
      const cause = appError.cause as
        | { response?: { status?: number; data?: unknown }; config?: { url?: string } }
        | undefined;
      logger.error('AuthRepository.register ✖ error', {
        kind: appError.kind,
        status: appError.status,
        message: appError.message,
        responseBody: cause?.response?.data,
        url: cause?.config?.url,
      });
      throw appError;
    }
  }
}

export const authRepository = new AuthRepository();
