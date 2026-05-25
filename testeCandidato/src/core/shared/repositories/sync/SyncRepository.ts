import {
  synchronize,
  type SyncDatabaseChangeSet,
} from '@nozbe/watermelondb/sync';

import { AppError, httpClient } from '../../../api';
import { database } from '../../../database';
import { logger } from '../../../utils/logger';
import { fotosRepository } from '../fotos';
import {
  SYNC_ROUTES,
  type PullResponseDto,
  type PushBodyDto,
} from '../../data/dtos/syncDto';

export interface SyncStats {
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  hadPreviousData: boolean;
  photosUploaded: number;
  photosFailed: number;
}

/**
 * SyncRepository encapsula a engine de sincronização do WatermelonDB.
 *
 * Regras do nosso backend (NestJS + Prisma):
 *  - Pull: GET /sync/pull?lastPulledAt=<ms>; quando não há dados locais
 *    (primeira execução), o WatermelonDB já passa `lastPulledAt = null` e
 *    nós omitimos a query string para o servidor retornar tudo.
 *  - Push: POST /sync/push com `{ changes }` no body.
 *
 * O retorno do `synchronize()` é usado apenas para telemetria interna; quem
 * decide quando rodar é o ViewModel (Home, Perfil) ou o agendador automático.
 */
export class SyncRepository {
  async run(): Promise<SyncStats> {
    const startedAt = Date.now();
    const hadPreviousData = await this.hasLocalData();
    logger.debug('SyncRepository.run iniciado', { hadPreviousData });

    try {
      // 1ª fase: sincroniza metadados. Isso garante que registros recém-criados
      // offline existam no servidor antes de tentarmos anexar fotos a eles.
      // O caminho da foto sobe como `file://...` (placeholder) — será sobrescrito
      // na 2ª fase pelo upload do binário, que faz upsert idempotente no backend.
      await synchronize({
        database,
        pullChanges: async ({ lastPulledAt }) => {
          const params: Record<string, string> = {};
          if (typeof lastPulledAt === 'number' && lastPulledAt > 0) {
            params.lastPulledAt = String(lastPulledAt);
          }
          const response = await httpClient.get<PullResponseDto>(
            SYNC_ROUTES.pull,
            { params },
          );
          return {
            changes: response.data.changes as unknown as SyncDatabaseChangeSet,
            timestamp: response.data.timestamp,
          };
        },
        pushChanges: async ({ changes }) => {
          const body: PushBodyDto = {
            changes: changes as unknown as PushBodyDto['changes'],
          };
          await httpClient.post(SYNC_ROUTES.push, body);
        },
        migrationsEnabledAtVersion: 1,
      });

      // 2ª fase: sobe binários das fotos ainda local-only. O endpoint
      // /fotos/registro/:id faz upsert por (id), substituindo o caminho
      // placeholder pela URL real do arquivo no servidor.
      const photoResult = await fotosRepository.drainPendingUploads();

      const finishedAt = Date.now();
      const stats: SyncStats = {
        startedAt,
        finishedAt,
        durationMs: finishedAt - startedAt,
        hadPreviousData,
        photosUploaded: photoResult.uploaded,
        photosFailed: photoResult.failed,
      };
      logger.debug('SyncRepository.run concluído', stats);
      return stats;
    } catch (error) {
      const appError = AppError.from(error);
      logger.error('SyncRepository.run falhou', {
        kind: appError.kind,
        message: appError.message,
        status: appError.status,
      });
      throw appError;
    }
  }

  /**
   * Heurística para detectar primeira execução: se não há nenhum registro
   * nem empresa no banco local, consideramos cold-start. O ViewModel pode
   * usar isso para decidir UI ("Carregando seus dados pela primeira vez…").
   */
  async hasLocalData(): Promise<boolean> {
    const [empresasCount, registrosCount] = await Promise.all([
      database.get('empresas').query().fetchCount(),
      database.get('registros').query().fetchCount(),
    ]);
    return empresasCount > 0 || registrosCount > 0;
  }
}

export const syncRepository = new SyncRepository();
