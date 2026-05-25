import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.empresa.findMany({
      where: { deletedAt: null },
    });
  }

  create(dto: CreateEmpresaDto) {
    return this.prisma.empresa.create({
      data: {
        nome: dto.nome,
      },
    });
  }

  findById(id: number) {
    return this.prisma.empresa.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async delet(id: number) {
    const e = await this.prisma.empresa.findUnique({ where: { id } });
    if (!e || e.deletedAt) throw new NotFoundException('Empresa não encontrada');

    return this.prisma.empresa.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findByIdOrFail(id: number) {
    const e = await this.findById(id);
    if (!e) throw new NotFoundException('Empresa não encontrada');
    return e;
  }
}
