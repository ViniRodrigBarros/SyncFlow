/**
 * Domain entities for the auth feature. Repositories return these; the
 * presentation layer never sees DTOs.
 */

export interface Credentials {
  login: string;
  password: string;
}

export interface Empresa {
  id: number;
  name: string;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  login: string;
  empresaId: number;
  empresa: Empresa;
}

export interface LoginResult {
  user: AuthenticatedUser;
  token: string;
}
