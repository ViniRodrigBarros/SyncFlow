export { AuthRepository, authRepository } from './AuthRepository';
export type { RefreshOutcome } from './AuthRepository';

export { FotosRepository, fotosRepository } from './FotosRepository';
export type { DrainPhotosResult } from './FotosRepository';

export { RegistrosRepository, registrosRepository } from './RegistrosRepository';

export { SyncRepository, syncRepository } from './SyncRepository';
export type { SyncStats } from './SyncRepository';

// Re-exports de DTOs/entities que antes vinham junto com cada barrel.
export {
  AUTH_ROUTES,
  AuthMapper,
  type AuthRoute,
  type EmpresaDto,
  type UsuarioDto,
  type LoginRequestDto,
  type LoginResponseDto,
} from '../data/dtos/authDto';
export type {
  Credentials,
  Empresa,
  AuthenticatedUser,
  LoginResult,
} from '../data/entities/authEntities';

export {
  SYNC_ROUTES,
  type PullResponseDto,
  type PushResponseDto,
  type PushBodyDto,
  type SyncChangeSet,
  type SyncDatabaseChanges,
} from '../data/dtos/syncDto';

export {
  REGISTROS_ROUTES,
  type RegistroDto,
  type FotoRegistroDto,
  type CreateRegistroRequestDto,
  type UpdateRegistroRequestDto,
} from '../data/dtos/registroDto';
export type {
  TipoRegistro,
  RegistroEntity,
  FotoEntity,
  CreateRegistroInput,
  UpdateRegistroInput,
  NewFotoInput,
} from '../data/entities/registroEntities';

export {
  FOTOS_ROUTES,
  type FotoUploadResponseDto,
} from '../data/dtos/fotoDto';
