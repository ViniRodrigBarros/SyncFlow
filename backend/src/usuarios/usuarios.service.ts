import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { empresa: true },
    });
  }
}
