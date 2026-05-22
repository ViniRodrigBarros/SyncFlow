import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from '../auth/current-user.decorator';

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

    return this.prisma.fotoRegistro.create({
      data: {
        id: fotoId || uuidv4(),
        registroId,
        caminho: fileRelativePath,
      },
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
