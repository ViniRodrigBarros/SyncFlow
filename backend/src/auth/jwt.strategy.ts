import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: number;
  login: string;
  empresaId: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'troque-este-segredo-em-producao',
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { empresa: true },
    });

    if (!usuario || usuario.deletedAt) {
      throw new UnauthorizedException('Usuário inválido');
    }

    return {
      id: usuario.id,
      login: usuario.login,
      nome: usuario.nome,
      empresaId: usuario.empresaId,
      empresa: usuario.empresa,
    };
  }
}
