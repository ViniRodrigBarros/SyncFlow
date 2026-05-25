import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from '../jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: { usuario: { findUnique: jest.Mock } };

  const payload: JwtPayload = {
    sub: 10,
    login: 'alpha@teste.com',
    empresaId: 1,
  };

  const empresaMock = { id: 1, nome: 'Empresa Alpha' };
  const usuarioMock = {
    id: 10,
    nome: 'Usuário Alpha',
    login: 'alpha@teste.com',
    empresaId: 1,
    deletedAt: null,
    empresa: empresaMock,
  };

  beforeEach(() => {
    prisma = { usuario: { findUnique: jest.fn() } };
    strategy = new JwtStrategy(prisma as unknown as PrismaService);
  });

  describe('validate', () => {
    it('retorna o usuário autenticado quando o payload é válido', async () => {
      prisma.usuario.findUnique.mockResolvedValue(usuarioMock);

      const result = await strategy.validate(payload);

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
        include: { empresa: true },
      });
      expect(result).toEqual({
        id: 10,
        login: 'alpha@teste.com',
        nome: 'Usuário Alpha',
        empresaId: 1,
        empresa: empresaMock,
      });
    });

    it('lança UnauthorizedException quando usuário não existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lança UnauthorizedException quando usuário está soft-deletado', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...usuarioMock,
        deletedAt: new Date(),
      });

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
