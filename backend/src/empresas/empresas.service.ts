import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.empresa.findUnique({ where: { id } });
  }

  async findByIdOrFail(id: number) {
    const e = await this.findById(id);
    if (!e) throw new NotFoundException('Empresa não encontrada');
    return e;
  }
}
