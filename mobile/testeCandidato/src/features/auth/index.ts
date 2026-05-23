export { AuthView as AuthScreen } from './presentation/AuthView';
export { useAuthViewModel } from './hooks/useAuthViewModel';
export type { AuthViewModel } from './hooks/useAuthViewModel';
export type {
  Credentials,
  RegisterInput,
  AuthenticatedUser,
  LoginResult,
  RegisterResult,
} from '../../core/shared/data/entities/authEntities';
