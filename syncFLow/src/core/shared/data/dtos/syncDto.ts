/**
 * Contrato do endpoint /sync no backend NestJS.
 *
 * O backend devolve um payload que segue exatamente o formato esperado pelo
 * WatermelonDB `synchronize()`: snake_case nos campos, timestamps em ms,
 * cada tabela com `{ created, updated, deleted }`. Por isso não precisamos
 * de Mapper — basta repassar o objeto para a engine de sync.
 */

export const SYNC_ROUTES = {
  pull: '/sync/pull',
  push: '/sync/push',
} as const;

export interface SyncChangeSet {
  created: Record<string, unknown>[];
  updated: Record<string, unknown>[];
  deleted: string[];
}

export interface SyncDatabaseChanges {
  empresas: SyncChangeSet;
  usuarios: SyncChangeSet;
  registros: SyncChangeSet;
  foto_registros: SyncChangeSet;
}

export interface PullResponseDto {
  changes: SyncDatabaseChanges;
  timestamp: number;
}

export interface PushResponseDto {
  ok: boolean;
  timestamp: number;
}

export interface PushBodyDto {
  changes: SyncDatabaseChanges;
}
