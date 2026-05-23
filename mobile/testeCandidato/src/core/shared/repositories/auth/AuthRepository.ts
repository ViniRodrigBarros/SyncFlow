import { httpClient, AppError } from '../../../api';
import { setAuthSession, clearAuthSession } from '../../services/AuthTokenStore';
import { logger } from '../../../utils/logger';
import type {
  Credentials,
  LoginResult,
  AuthenticatedUser,
} from '../../data/entities/authEntities';
import {
  AUTH_ROUTES,
  AuthMapper,
  type LoginRequestDto,
  type LoginResponseDto,
  type UsuarioDto,
} from '../../data/dtos/authDto';

/**
 * AuthRepository é a única porta de entrada para chamadas de autenticação.
 * Camadas superiores (ViewModels) usam ele para login, recuperação de sessão
 * e logout — sem precisar conhecer DTOs, axios ou AsyncStorage.
 */
export class AuthRepository {
  async signIn(input: Credentials): Promise<LoginResult> {
    const payload: LoginRequestDto = {
      login: input.login,
      senha: input.password,
    };
    logger.debug('AuthRepository.signIn → request', {
      url: AUTH_ROUTES.signIn,
      payload: { login: payload.login, senha: '***' },
    });

    try {
      const response = await httpClient.post<LoginResponseDto>(
        AUTH_ROUTES.signIn,
        payload,
      );
      logger.debug('AuthRepository.signIn ← response', {
        status: response.status,
      });

      const result = AuthMapper.loginToDomain(response.data);
      await setAuthSession(result.token, result.user);
      return result;
    } catch (error) {
      const appError = AppError.from(error);
      logger.error('AuthRepository.signIn ✖ error', {
        kind: appError.kind,
        status: appError.status,
        message: appError.message,
      });
      throw appError;
    }
  }

  async fetchMe(): Promise<AuthenticatedUser> {
    try {
      const response = await httpClient.get<UsuarioDto>(AUTH_ROUTES.me);
      return AuthMapper.userToDomain(response.data);
    } catch (error) {
      const appError = AppError.from(error);
      logger.error('AuthRepository.fetchMe ✖ error', {
        kind: appError.kind,
        status: appError.status,
        message: appError.message,
      });
      throw appError;
    }
  }

  async signOut(): Promise<void> {
    await clearAuthSession();
  }
}

export const authRepository = new AuthRepository();
