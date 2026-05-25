import {
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    usuario: { findUnique: jest.Mock; create: jest.Mock };
    empresa: { findUnique: jest.Mock };
  };
  let jwt: { signAsync: jest.Mock };

  const empresaMock = {
    id: 1,
    nome: 'Empresa Alpha',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const usuarioMock = {
    id: 10,
    nome: 'Usuário Alpha',
    login: 'alpha@teste.com',
    senha: 'hash-bcrypt',
    empresaId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    empresa: empresaMock,
  };

  beforeEach(() => {
    prisma = {
      usuario: { findUnique: jest.fn(), create: jest.fn() },
      empresa: { findUnique: jest.fn() },
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('jwt-token-fake') };
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
    );
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('retorna token e usuário quando credenciais são válidas', async () => {
      prisma.usuario.findUnique.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        login: 'alpha@teste.com',
        senha: '123456',
      });

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { login: 'alpha@teste.com' },
        include: { empresa: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash-bcrypt');
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: 10,
        login: 'alpha@teste.com',
        empresaId: 1,
      });
      expect(result).toEqual({
        token: 'jwt-token-fake',
        usuario: {
          id: 10,
          nome: 'Usuário Alpha',
          login: 'alpha@teste.com',
          empresaId: 1,
          empresa: { id: 1, nome: 'Empresa Alpha' },
        },
      });
    });

    it('lança UnauthorizedException quando usuário não existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ login: 'nao-existe', senha: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });

    it('lança UnauthorizedException quando usuário está soft-deletado', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...usuarioMock,
        deletedAt: new Date(),
      });

      await expect(
        service.login({ login: 'alpha@teste.com', senha: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('lança UnauthorizedException quando senha não confere', async () => {
      prisma.usuario.findUnique.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ login: 'alpha@teste.com', senha: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const dto = {
      nome: 'Novo Usuário',
      login: 'novo@teste.com',
      senha: '123456',
      empresaId: 1,
    };

    it('cria usuário, hasheia senha e retorna token', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.empresa.findUnique.mockResolvedValue(empresaMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('senha-hashada');
      prisma.usuario.create.mockResolvedValue({
        ...usuarioMock,
        nome: dto.nome,
        login: dto.login,
        senha: 'senha-hashada',
      });

      const result = await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: {
          nome: dto.nome,
          login: dto.login,
          senha: 'senha-hashada',
          empresaId: 1,
        },
        include: { empresa: true },
      });
      expect(jwt.signAsync).toHaveBeenCalled();
      expect(result.token).toBe('jwt-token-fake');
      expect(result.usuario.login).toBe(dto.login);
    });

    it('rejeita quando login já existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(usuarioMock);
      prisma.empresa.findUnique.mockResolvedValue(empresaMock);

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it('rejeita quando empresa não existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.empresa.findUnique.mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it('rejeita quando empresa está soft-deletada', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.empresa.findUnique.mockResolvedValue({
        ...empresaMock,
        deletedAt: new Date(),
      });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it('faz as consultas de usuário e empresa em paralelo', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.empresa.findUnique.mockResolvedValue(empresaMock);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
      prisma.usuario.create.mockResolvedValue(usuarioMock);

      await service.register(dto);

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { login: dto.login },
      });
      expect(prisma.empresa.findUnique).toHaveBeenCalledWith({
        where: { id: dto.empresaId },
      });
    });
  });

  describe('me', () => {
    it('retorna dados do usuário com empresa', async () => {
      prisma.usuario.findUnique.mockResolvedValue(usuarioMock);

      const result = await service.me(10);

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 10 },
        include: { empresa: true },
      });
      expect(result).toEqual({
        id: 10,
        nome: 'Usuário Alpha',
        login: 'alpha@teste.com',
        empresaId: 1,
        empresa: { id: 1, nome: 'Empresa Alpha' },
      });
    });

    it('lança UnauthorizedException quando usuário não existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.me(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
