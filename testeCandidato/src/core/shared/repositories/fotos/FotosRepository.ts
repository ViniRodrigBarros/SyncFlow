import { Q } from '@nozbe/watermelondb';

import { AppError, httpClient } from '../../../api';
import { database, FotoRegistro } from '../../../database';
import { logger } from '../../../utils/logger';
import { FOTOS_ROUTES, type FotoUploadResponseDto } from '../../data/dtos/fotoDto';

export interface DrainPhotosResult {
  uploaded: number;
  failed: number;
}

/**
 * FotosRepository — Drena fotos com `is_local_only = true` para o backend
 * via `POST /fotos/registro/:registroId` (multipart). É chamado pelo sync
 * engine *antes* do `synchronize()` do WatermelonDB, garantindo que:
 *
 *  1. O arquivo binário chega ao servidor.
 *  2. O backend devolve o `caminho` final (URL) e o mesmo `id` recebido.
 *  3. Atualizamos o model local: `is_local_only = false`, `caminho = URL`.
 *  4. Quando o sync regular roda, o push do `foto_registros` carrega a URL
 *     correta — não a `file://` local.
 *
 * Cada upload é independente: uma falha em uma foto não impede as outras
 * de subirem. A próxima execução do sync pega o que restou.
 */
export class FotosRepository {
  /** Conta quantas fotos ainda estão pendentes de upload. */
  async countPending(): Promise<number> {
    return database
      .get<FotoRegistro>('foto_registros')
      .query(Q.where('is_local_only', true))
      .fetchCount();
  }

  /** Faz upload de todas as fotos `is_local_only = true`. Nunca lança. */
  async drainPendingUploads(): Promise<DrainPhotosResult> {
    const pending = await database
      .get<FotoRegistro>('foto_registros')
      .query(Q.where('is_local_only', true))
      .fetch();

    if (pending.length === 0) {
      return { uploaded: 0, failed: 0 };
    }
    logger.debug(`FotosRepository: drenando ${pending.length} foto(s)`);

    let uploaded = 0;
    let failed = 0;
    for (const foto of pending) {
      try {
        const remote = await this.uploadOne(
          foto.registroId,
          foto.id,
          foto.localUri ?? foto.caminho,
        );
        await database.write(async () => {
          await foto.update((f: FotoRegistro) => {
            f.caminho = remote.caminho;
            f.isLocalOnly = false;
          });
        });
        uploaded += 1;
      } catch (error) {
        const appError = AppError.from(error);
        logger.warn('Upload da foto falhou — tenta no próximo sync', {
          fotoId: foto.id,
          message: appError.message,
          kind: appError.kind,
        });
        failed += 1;
      }
    }

    logger.debug('FotosRepository.drainPendingUploads done', {
      uploaded,
      failed,
    });
    return { uploaded, failed };
  }

  private async uploadOne(
    registroId: string,
    fotoId: string,
    localUri: string,
  ): Promise<FotoUploadResponseDto> {
    const form = new FormData();
    const guessedName = localUri.split('/').pop() ?? `${fotoId}.jpg`;
    const guessedExt = guessedName.split('.').pop()?.toLowerCase() ?? 'jpg';
    const guessedMime = guessedExt === 'png' ? 'image/png' : 'image/jpeg';

    // React Native aceita `{ uri, name, type }` como BlobPart no FormData.
    form.append('fotos', {
      uri: localUri,
      name: guessedName,
      type: guessedMime,
    } as unknown as Blob);
    form.append('ids', JSON.stringify([fotoId]));

    const response = await httpClient.post<FotoUploadResponseDto[]>(
      FOTOS_ROUTES.upload(registroId),
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data: unknown) => data,
      },
    );
    const first = response.data?.[0];
    if (!first) {
      throw new Error('Servidor não devolveu metadata da foto enviada');
    }
    return first;
  }
}

export const fotosRepository = new FotosRepository();
