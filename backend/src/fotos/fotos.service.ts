import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/current-user.decorator';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

@Injectable()
export class FotosService {
  constructor(private readonly prisma: PrismaService) {}

  async addFoto(
    registroId: string,
    fileRelativePath: string,
    user: AuthUser,
    fotoId?: string,
  ) {
    const registro = await this.prisma.registro.findUnique({
      where: { id: registroId },
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException('Registro não encontrado');
    }
    if (registro.empresaId !== user.empresaId) {
      throw new ForbiddenException('Registro pertence a outra empresa');
    }

    // Upsert idempotente. O id da foto pode já existir se o sync.push criou a
    // linha antes (cenário: criação offline → metadata vai pelo /sync/push com
    // caminho=file://local, e logo depois o binário sobe por aqui).
    if (fotoId) {
      const existing = await this.prisma.fotoRegistro.findUnique({
        where: { id: fotoId },
      });
      if (existing) {
        if (existing.registroId !== registroId) {
          throw new ForbiddenException('Foto pertence a outro registro');
        }
        const previousPath = existing.caminho;
        const updated = await this.prisma.fotoRegistro.update({
          where: { id: fotoId },
          data: { caminho: fileRelativePath, deletedAt: null },
        });
        await this.removePreviousFile(previousPath, fileRelativePath);
        return updated;
      }
    }

    return this.prisma.fotoRegistro.create({
      data: {
        id: fotoId || uuidv4(),
        registroId,
        caminho: fileRelativePath,
      },
    });
  }

  /**
   * Remove o arquivo anterior do disco quando uma foto é re-enviada.
   * Só tenta se a string parece um caminho local servido por nós
   * (`/uploads/...`) — placeholders `file://` ou URLs externas são ignoradas.
   */
  private async removePreviousFile(
    previousPath: string,
    currentPath: string,
  ): Promise<void> {
    if (!previousPath || previousPath === currentPath) return;
    if (!previousPath.startsWith('/uploads/')) return;
    const filename = previousPath.replace(/^\/uploads\//, '');
    if (!filename || filename.includes('..')) return;
    const absolute = join(
      process.cwd(),
      uploadDir.replace(/^\.\//, ''),
      filename,
    );
    await unlink(absolute).catch(() => {
      // best-effort: arquivo já foi removido, nunca existiu, etc.
    });
  }

  async listByRegistro(registroId: string, user: AuthUser) {
    const registro = await this.prisma.registro.findUnique({
      where: { id: registroId },
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException('Registro não encontrado');
    }
    if (registro.empresaId !== user.empresaId) {
      throw new ForbiddenException('Registro pertence a outra empresa');
    }
    return this.prisma.fotoRegistro.findMany({
      where: { registroId, deletedAt: null },
    });
  }

  async remove(fotoId: string, user: AuthUser) {
    const foto = await this.prisma.fotoRegistro.findUnique({
      where: { id: fotoId },
      include: { registro: true },
    });
    if (!foto || foto.deletedAt) {
      throw new NotFoundException('Foto não encontrada');
    }
    if (foto.registro.empresaId !== user.empresaId) {
      throw new ForbiddenException();
    }
    await this.prisma.fotoRegistro.update({
      where: { id: fotoId },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }
}
