import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const [usuarioExistente, empresa] = await Promise.all([
      this.prisma.usuario.findUnique({
        where: { login: dto.login },
      }),
      this.prisma.empresa.findUnique({
        where: { id: dto.empresaId },
      }),
    ]);

    if (usuarioExistente) {
      throw new BadRequestException('Login já está em uso');
    }

    if (!empresa || empresa.deletedAt) {
      throw new BadRequestException('Empresa inválida');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        login: dto.login,
        senha: senhaHash,
        empresaId: dto.empresaId,
      },
      include: { empresa: true },
    });

    const payload: JwtPayload = {
      sub: usuario.id,
      login: usuario.login,
      empresaId: usuario.empresaId,
    };

    const token = await this.jwt.signAsync(payload);

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        empresaId: usuario.empresaId,
        empresa: {
          id: usuario.empresa.id,
          nome: usuario.empresa.nome,
        },
      },
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { login: dto.login },
      include: { empresa: true },
    });

    if (!usuario || usuario.deletedAt) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const senhaOk = await bcrypt.compare(dto.senha, usuario.senha);
    if (!senhaOk) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      login: usuario.login,
      empresaId: usuario.empresaId,
    };

    const token = await this.jwt.signAsync(payload);

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        empresaId: usuario.empresaId,
        empresa: {
          id: usuario.empresa.id,
          nome: usuario.empresa.nome,
        },
      },
    };
  }

  async me(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { empresa: true },
    });
    if (!usuario) throw new UnauthorizedException();
    return {
      id: usuario.id,
      nome: usuario.nome,
      login: usuario.login,
      empresaId: usuario.empresaId,
      empresa: { id: usuario.empresa.id, nome: usuario.empresa.nome },
    };
  }
}
