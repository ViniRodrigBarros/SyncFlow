import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/current-user.decorator';
import { TipoRegistro } from '@prisma/client';

interface PushChangeSet<T> {
  created?: T[];
  updated?: T[];
  deleted?: string[];
}

interface PushBody {
  changes: {
    empresas?: PushChangeSet<any>;
    usuarios?: PushChangeSet<any>;
    registros?: PushChangeSet<any>;
    foto_registros?: PushChangeSet<any>;
  };
}

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  async pull(lastPulledAt: number | null, user: AuthUser) {
    const since = lastPulledAt ? new Date(lastPulledAt) : new Date(0);
    const now = new Date();
    const empresaId = user.empresaId;

    const empresas = await this.prisma.empresa.findMany({
      where: { id: empresaId },
    });
    const usuarios = await this.prisma.usuario.findMany({
      where: { empresaId },
    });
    const registros = await this.prisma.registro.findMany({
      where: { empresaId },
    });
    const registroIds = registros.map((r) => r.id);
    const fotos = registroIds.length
      ? await this.prisma.fotoRegistro.findMany({
          where: { registroId: { in: registroIds } },
        })
      : [];

    return {
      changes: {
        empresas: this.splitChanges(
          empresas.map((e) => ({
            id: String(e.id),
            nome: e.nome,
            created_at: e.createdAt.getTime(),
            updated_at: e.updatedAt.getTime(),
          })),
          empresas.map((e) => ({
            entity: e,
            isDeleted: !!e.deletedAt,
          })),
          since,
        ),
        usuarios: this.splitChanges(
          usuarios.map((u) => ({
            id: String(u.id),
            nome: u.nome,
            login: u.login,
            empresa_id: String(u.empresaId),
            created_at: u.createdAt.getTime(),
            updated_at: u.updatedAt.getTime(),
          })),
          usuarios.map((u) => ({ entity: u, isDeleted: !!u.deletedAt })),
          since,
        ),
        registros: this.splitChanges(
          registros.map((r) => ({
            id: r.id,
            empresa_id: String(r.empresaId),
            usuario_id: String(r.usuarioId),
            tipo: r.tipo,
            data_hora: r.dataHora.getTime(),
            descricao: r.descricao,
            created_at: r.createdAt.getTime(),
            updated_at: r.updatedAt.getTime(),
          })),
          registros.map((r) => ({ entity: r, isDeleted: !!r.deletedAt })),
          since,
        ),
        foto_registros: this.splitChanges(
          fotos.map((f) => ({
            id: f.id,
            registro_id: f.registroId,
            caminho: f.caminho,
            created_at: f.createdAt.getTime(),
            updated_at: f.updatedAt.getTime(),
          })),
          fotos.map((f) => ({ entity: f, isDeleted: !!f.deletedAt })),
          since,
        ),
      },
      timestamp: now.getTime(),
    };
  }

  private splitChanges(
    items: any[],
    meta: { entity: { createdAt: Date; updatedAt: Date; deletedAt: Date | null }; isDeleted: boolean }[],
    since: Date,
  ) {
    const created: any[] = [];
    const updated: any[] = [];
    const deleted: string[] = [];

    items.forEach((item, idx) => {
      const m = meta[idx];
      if (m.isDeleted) {
        if (m.entity.deletedAt && m.entity.deletedAt > since) {
          deleted.push(item.id);
        }
        return;
      }
      if (m.entity.createdAt > since) {
        created.push(item);
      } else if (m.entity.updatedAt > since) {
        updated.push(item);
      }
    });

    return { created, updated, deleted };
  }

  async push(body: PushBody, user: AuthUser) {
    const empresaId = user.empresaId;
    const usuarioId = user.id;
    const changes = body?.changes || {};

    await this.prisma.$transaction(async (tx) => {
      const regChanges = changes.registros;
      if (regChanges) {
        const upsertRegistro = async (r: any) => {
          this.validateRegistroPayload(r);
          const data = {
            tipo: this.parseTipo(r.tipo),
            dataHora: new Date(Number(r.data_hora)),
            descricao: String(r.descricao),
          };
          const existing = await tx.registro.findUnique({
            where: { id: r.id },
          });
          if (existing) {
            if (existing.empresaId !== empresaId) return;
            await tx.registro.update({
              where: { id: r.id },
              data: { ...data, deletedAt: null },
            });
          } else {
            await tx.registro.create({
              data: {
                id: String(r.id),
                empresaId,
                usuarioId,
                ...data,
              },
            });
          }
        };

        for (const r of regChanges.created || []) {
          await upsertRegistro(r);
        }
        for (const r of regChanges.updated || []) {
          await upsertRegistro(r);
        }
        for (const id of regChanges.deleted || []) {
          const existing = await tx.registro.findUnique({ where: { id } });
          if (existing && existing.empresaId === empresaId) {
            await tx.registro.update({
              where: { id },
              data: { deletedAt: new Date() },
            });
          }
        }
      }

      const fotoChanges = changes.foto_registros;
      if (fotoChanges) {
        const upsertFoto = async (f: any) => {
          if (!f?.id || !f?.registro_id || typeof f.caminho !== 'string') {
            throw new BadRequestException(
              'foto_registro requer id, registro_id e caminho',
            );
          }
          const existing = await tx.fotoRegistro.findUnique({
            where: { id: f.id },
          });
          if (existing) {
            const ownerReg = await tx.registro.findUnique({
              where: { id: existing.registroId },
            });
            if (!ownerReg || ownerReg.empresaId !== empresaId) return;
            await tx.fotoRegistro.update({
              where: { id: f.id },
              data: { caminho: f.caminho, deletedAt: null },
            });
          } else {
            const reg = await tx.registro.findUnique({
              where: { id: f.registro_id },
            });
            if (!reg || reg.empresaId !== empresaId) return;
            await tx.fotoRegistro.create({
              data: {
                id: String(f.id),
                caminho: f.caminho,
                registroId: f.registro_id,
              },
            });
          }
        };

        for (const f of fotoChanges.created || []) {
          await upsertFoto(f);
        }
        for (const f of fotoChanges.updated || []) {
          await upsertFoto(f);
        }
        for (const id of fotoChanges.deleted || []) {
          const existing = await tx.fotoRegistro.findUnique({ where: { id } });
          if (!existing) continue;
          const reg = await tx.registro.findUnique({
            where: { id: existing.registroId },
          });
          if (!reg || reg.empresaId !== empresaId) continue;
          await tx.fotoRegistro.update({
            where: { id },
            data: { deletedAt: new Date() },
          });
        }
      }
    });

    return { ok: true, timestamp: Date.now() };
  }

  private validateRegistroPayload(r: any): void {
    if (!r || typeof r !== 'object') {
      throw new BadRequestException('registro inválido');
    }
    if (!r.id || typeof r.id !== 'string') {
      throw new BadRequestException('registro.id é obrigatório');
    }
    if (r.tipo === undefined || r.tipo === null) {
      throw new BadRequestException('registro.tipo é obrigatório');
    }
    if (r.data_hora === undefined || r.data_hora === null) {
      throw new BadRequestException('registro.data_hora é obrigatório');
    }
    const d = new Date(Number(r.data_hora));
    if (isNaN(d.getTime())) {
      throw new BadRequestException('registro.data_hora inválido');
    }
    if (typeof r.descricao !== 'string' || r.descricao.length === 0) {
      throw new BadRequestException('registro.descricao é obrigatório');
    }
  }

  private parseTipo(value: any): TipoRegistro {
    if (value === 'COMPRA' || value === 'compra') return TipoRegistro.COMPRA;
    if (value === 'VENDA' || value === 'venda') return TipoRegistro.VENDA;
    throw new BadRequestException(`tipo inválido: ${value}`);
  }
}
