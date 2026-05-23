import { httpClient, AppError } from '../../../api';
import {
  clearAuthSession,
  getAuthToken,
  setAuthSession,
  useAuthTokenStore,
} from '../../services/AuthTokenStore';
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

export type RefreshOutcome =
  | { status: 'refreshed'; user: AuthenticatedUser }
  | { status: 'no-session' }
  | { status: 'offline' }
  | { status: 'expired' };

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

  /**
   * Tenta renovar a sessão consultando /auth/me.
   *  - Se não há token persistido, devolve `no-session`.
   *  - Se for offline/timeout, devolve `offline` e mantém a sessão local.
   *  - Se o backend recusar (401/403), limpa a sessão e devolve `expired`.
   *  - Se sucesso, atualiza nome/empresa do usuário no AsyncStorage.
   *
   * Nunca lança — pensado para ser chamado em background pela Splash/Home.
   */
  async refreshSession(): Promise<RefreshOutcome> {
    const token = getAuthToken();
    if (!token) return { status: 'no-session' };

    try {
      const user = await this.fetchMe();
      await useAuthTokenStore.getState().setSession(token, user);
      return { status: 'refreshed', user };
    } catch (error) {
      const appError = AppError.from(error);
      if (appError.kind === 'unauthorized' || appError.kind === 'forbidden') {
        logger.warn('refreshSession: token expirado, limpando sessão');
        await clearAuthSession();
        return { status: 'expired' };
      }
      logger.info('refreshSession: sem rede, mantendo sessão local', {
        kind: appError.kind,
      });
      return { status: 'offline' };
    }
  }

  async signOut(): Promise<void> {
    await clearAuthSession();
  }
}

export const authRepository = new AuthRepository();
