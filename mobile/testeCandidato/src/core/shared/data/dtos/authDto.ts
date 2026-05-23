import type {
  AuthenticatedUser,
  LoginResult,
  RegisterResult,
} from '../entities/authEntities';

export const AUTH_ROUTES = {
  signIn: '/auth/login',
  register: '/auth/register',
} as const;

export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES];

export const buildAuthUrl = (path: string): string => path;

export interface UserDto {
  id: string;
  nome: string;
  email: string;
}

export interface LoginRequestDto {
  identificador: string;
  senha: string;
}

export interface LoginResponseDto {
  access_token: string;
  user: UserDto;
}

export interface RegisterRequestDto {
  nome: string;
  email: string;
  senha: string;
}

export interface RegisterResponseDto {
  access_token?: string;
  user: UserDto;
}

export class AuthMapper {
  static userToDomain(dto: UserDto): AuthenticatedUser {
    return {
      id: dto.id,
      name: dto.nome,
      email: dto.email,
    };
  }

  static loginToDomain(dto: LoginResponseDto): LoginResult {
    return {
      user: AuthMapper.userToDomain(dto.user),
      token: dto.access_token,
    };
  }

  static registerToDomain(dto: RegisterResponseDto): RegisterResult {
    return {
      user: AuthMapper.userToDomain(dto.user),
      token: dto.access_token ?? null,
    };
  }
}
