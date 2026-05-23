export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResult {
  user: AuthenticatedUser;
  token: string;
}

export interface RegisterResult {
  user: AuthenticatedUser;
  token: string | null;
}
