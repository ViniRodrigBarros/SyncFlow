import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistroDto } from './dto/create-registro.dto';
import { UpdateRegistroDto } from './dto/update-registro.dto';
import { AuthUser } from '../auth/current-user.decorator';

@Injectable()
export class RegistrosService {
  constructor(private readonly prisma: PrismaService) {}

  listByEmpresa(empresaId: number) {
    return this.prisma.registro.findMany({
      where: { empresaId, deletedAt: null },
      include: { fotos: { where: { deletedAt: null } } },
      orderBy: { dataHora: 'desc' },
    });
  }

  async findById(id: string, user: AuthUser) {
    const reg = await this.prisma.registro.findUnique({
      where: { id },
      include: { fotos: { where: { deletedAt: null } } },
    });
    if (!reg || reg.deletedAt) {
      throw new NotFoundException('Registro não encontrado');
    }
    if (reg.empresaId !== user.empresaId) {
      throw new ForbiddenException('Registro pertence a outra empresa');
    }
    return reg;
  }

  create(dto: CreateRegistroDto, user: AuthUser) {
    return this.prisma.registro.create({
      data: {
        id: dto.id || uuidv4(),
        empresaId: user.empresaId,
        usuarioId: user.id,
        tipo: dto.tipo,
        dataHora: new Date(dto.dataHora),
        descricao: dto.descricao,
      },
      include: { fotos: true },
    });
  }

  async update(id: string, dto: UpdateRegistroDto, user: AuthUser) {
    await this.findById(id, user);
    return this.prisma.registro.update({
      where: { id },
      data: {
        ...(dto.tipo && { tipo: dto.tipo }),
        ...(dto.dataHora && { dataHora: new Date(dto.dataHora) }),
        ...(dto.descricao && { descricao: dto.descricao }),
      },
      include: { fotos: { where: { deletedAt: null } } },
    });
  }

  async remove(id: string, user: AuthUser) {
    await this.findById(id, user);
    await this.prisma.registro.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }
}
