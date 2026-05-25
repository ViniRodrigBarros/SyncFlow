import type {
  AuthenticatedUser,
  LoginResult,
} from '../entities/authEntities';

/**
 * DTOs that mirror the NestJS backend exactly. AuthMapper converts them into
 * domain entities so the rest of the app stays unaware of the wire format.
 */

export const AUTH_ROUTES = {
  signIn: '/auth/login',
  me: '/auth/me',
} as const;

export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];

export interface EmpresaDto {
  id: number;
  nome: string;
}

export interface UsuarioDto {
  id: number;
  nome: string;
  login: string;
  empresaId: number;
  empresa: EmpresaDto;
}

export interface LoginRequestDto {
  login: string;
  senha: string;
}

export interface LoginResponseDto {
  token: string;
  usuario: UsuarioDto;
}

export class AuthMapper {
  static userToDomain(dto: UsuarioDto): AuthenticatedUser {
    return {
      id: dto.id,
      name: dto.nome,
      login: dto.login,
      empresaId: dto.empresaId,
      empresa: { id: dto.empresa.id, name: dto.empresa.nome },
    };
  }

  static loginToDomain(dto: LoginResponseDto): LoginResult {
    return {
      token: dto.token,
      user: AuthMapper.userToDomain(dto.usuario),
    };
  }
}
