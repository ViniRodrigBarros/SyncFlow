import { Q } from '@nozbe/watermelondb';

import { database, Registro, FotoRegistro } from '../../database';
import { logger } from '../../utils/logger';
import { useAuthTokenStore } from '../services/AuthTokenStore';
import type {
  CreateRegistroInput,
  FotoEntity,
  RegistroEntity,
  UpdateRegistroInput,
} from '../data/entities/registroEntities';

interface RawRecord {
  _status?: 'created' | 'updated' | 'deleted' | 'synced';
}

const isPending = (model: Registro | FotoRegistro): boolean => {
  const raw = (model as unknown as { _raw?: RawRecord })._raw;
  const status = raw?._status ?? 'synced';
  return status !== 'synced';
};

const mapFoto = (foto: FotoRegistro): FotoEntity => ({
  id: foto.id,
  registroId: foto.registroId,
  caminho: foto.caminho,
  localUri: foto.localUri ?? null,
  isLocalOnly: foto.isLocalOnly,
  createdAt: foto.createdAt?.getTime?.() ?? 0,
});

const mapRegistro = (registro: Registro, fotos: FotoRegistro[]): RegistroEntity => ({
  id: registro.id,
  empresaId: registro.empresaId,
  usuarioId: registro.usuarioId,
  tipo: registro.tipo,
  dataHora: registro.dataHora?.getTime?.() ?? 0,
  descricao: registro.descricao,
  isPending: isPending(registro),
  hasError: false,
  createdAt: registro.createdAt?.getTime?.() ?? 0,
  updatedAt: registro.updatedAt?.getTime?.() ?? 0,
  fotos: fotos.map(mapFoto),
});

/**
 * RegistrosRepository — operações offline-first sobre a tabela `registros`.
 *
 * Toda mutação acontece dentro de `database.write()`, garantindo:
 *  - Persistência atômica no SQLite local.
 *  - Marcação automática como `_status: 'created' | 'updated' | 'deleted'`
 *    pelo WatermelonDB — o sync engine envia para o backend depois.
 *
 * O acesso ao backend é feito **exclusivamente** pelo sync engine
 * (`SyncRepository.run()`). Telas que precisam de dados em tempo real
 * podem observar `database.get('registros').query(...).observe()`.
 */
export class RegistrosRepository {
  /** Resolve o `empresaId` e `usuarioId` da sessão corrente. */
  private requireSession(): { empresaId: string; usuarioId: string } {
    const user = useAuthTokenStore.getState().user;
    if (!user) {
      throw new Error('Nenhum usuário logado — registro não pode ser criado.');
    }
    return {
      empresaId: String(user.empresaId),
      usuarioId: String(user.id),
    };
  }

  async findById(id: string): Promise<RegistroEntity | null> {
    try {
      const registro = await database.get<Registro>('registros').find(id);
      const fotos = await database
        .get<FotoRegistro>('foto_registros')
        .query(Q.where('registro_id', id))
        .fetch();
      return mapRegistro(registro, fotos);
    } catch (error) {
      logger.warn('RegistrosRepository.findById não encontrou', { id, error });
      return null;
    }
  }

  async create(input: CreateRegistroInput): Promise<RegistroEntity> {
    const { empresaId, usuarioId } = this.requireSession();
    let createdId = '';

    await database.write(async () => {
      const registro = await database
        .get<Registro>('registros')
        .create((r: Registro) => {
          r.empresaId = empresaId;
          r.usuarioId = usuarioId;
          r.tipo = input.tipo;
          r.dataHora = new Date(input.dataHora);
          r.descricao = input.descricao;
        });
      createdId = registro.id;

      for (const foto of input.fotos) {
        await database
          .get<FotoRegistro>('foto_registros')
          .create((f: FotoRegistro) => {
            f.registroId = registro.id;
            f.caminho = foto.localUri;
            f.localUri = foto.localUri;
            f.isLocalOnly = true;
          });
      }
    });

    const result = await this.findById(createdId);
    if (!result) {
      throw new Error('Falha ao recuperar registro recém-criado');
    }
    logger.debug('RegistrosRepository.create OK', {
      id: result.id,
      fotos: result.fotos.length,
    });
    return result;
  }

  async update(input: UpdateRegistroInput): Promise<RegistroEntity> {
    await database.write(async () => {
      const registro = await database.get<Registro>('registros').find(input.id);
      await registro.update((r: Registro) => {
        if (input.tipo !== undefined) r.tipo = input.tipo;
        if (input.dataHora !== undefined) r.dataHora = new Date(input.dataHora);
        if (input.descricao !== undefined) r.descricao = input.descricao;
      });

      for (const fotoId of input.fotosToRemove ?? []) {
        try {
          const foto = await database
            .get<FotoRegistro>('foto_registros')
            .find(fotoId);
          await foto.markAsDeleted();
        } catch (error) {
          logger.warn('Foto a remover não encontrada — ignorando', {
            fotoId,
            error,
          });
        }
      }

      for (const novaFoto of input.fotosToAdd ?? []) {
        await database
          .get<FotoRegistro>('foto_registros')
          .create((f: FotoRegistro) => {
            f.registroId = input.id;
            f.caminho = novaFoto.localUri;
            f.localUri = novaFoto.localUri;
            f.isLocalOnly = true;
          });
      }
    });

    const result = await this.findById(input.id);
    if (!result) {
      throw new Error('Registro desapareceu após update');
    }
    return result;
  }

  async remove(id: string): Promise<void> {
    await database.write(async () => {
      const registro = await database.get<Registro>('registros').find(id);
      const fotos = await database
        .get<FotoRegistro>('foto_registros')
        .query(Q.where('registro_id', id))
        .fetch();
      for (const foto of fotos) {
        await foto.markAsDeleted();
      }
      await registro.markAsDeleted();
    });
    logger.debug('RegistrosRepository.remove OK', { id });
  }
}

export const registrosRepository = new RegistrosRepository();
